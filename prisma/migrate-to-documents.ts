/**
 * Data migration script: Post/Category → Document model
 *
 * This script transforms existing data into the unified Document model:
 * 1. Categories → Documents with type: CATEGORY
 * 2. Posts → Documents with type: POST (reusing IDs to preserve references)
 * 3. PostTag → DocumentTag
 * 4. Comment.postId → Comment.documentId (values unchanged since we reuse post IDs)
 *
 * IMPORTANT: Run this BEFORE pushing the new schema to the database.
 * The script uses raw SQL to read old tables, so it works even after schema changes.
 *
 * Usage:
 *   npx tsx prisma/migrate-to-documents.ts
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface OldCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OldPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  views: number;
  authorId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OldPostTag {
  postId: string;
  tagId: string;
}

async function main() {
  console.log("Starting migration to Document model...\n");

  // Check if old tables exist
  const tablesResult = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('Post', 'Category', 'PostTag')
  `;

  const existingTables = new Set(tablesResult.map((r) => r.tablename));

  if (!existingTables.has("Post") && !existingTables.has("Category")) {
    console.log("✓ Old tables (Post, Category) not found. Migration may have already run.");
    console.log("  Checking if Document table exists...");

    const docCheck = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'Document'
    `;

    if (docCheck.length > 0) {
      console.log("✓ Document table exists. Migration appears complete.");
      return;
    } else {
      console.log("✗ Neither old nor new tables found. Please check your database connection.");
      process.exit(1);
    }
  }

  console.log("Found old tables:", Array.from(existingTables).join(", "));
  console.log("");

  // Step 1: Migrate Categories → Documents (type: CATEGORY)
  console.log("Step 1: Migrating Categories to Documents...");
  const categories = await prisma.$queryRaw<OldCategory[]>`
    SELECT * FROM "Category" ORDER BY "createdAt" ASC
  `;

  const categoryIdMap = new Map<string, string>(); // old category ID → new document ID
  let categoryCount = 0;

  for (const cat of categories) {
    // Create a document for each category
    const newDocId = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "Document" (
        id, title, slug, type, published, "publishedAt", views,
        "authorId", "createdAt", "updatedAt"
      )
      SELECT
        gen_random_uuid()::text,
        ${cat.name},
        ${cat.slug},
        'CATEGORY',
        true,
        ${cat.createdAt},
        0,
        (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1),
        ${cat.createdAt},
        ${cat.updatedAt}
      RETURNING id
    `;

    categoryIdMap.set(cat.id, newDocId[0].id);
    categoryCount++;
  }

  console.log(`✓ Migrated ${categoryCount} categories to Documents\n`);

  // Step 2: Migrate Posts → Documents (type: POST)
  console.log("Step 2: Migrating Posts to Documents...");
  const posts = await prisma.$queryRaw<OldPost[]>`
    SELECT * FROM "Post" ORDER BY "createdAt" ASC
  `;

  let postCount = 0;

  for (const post of posts) {
    // Map old categoryId to new document categoryId
    const newCategoryId = post.categoryId ? categoryIdMap.get(post.categoryId) : null;

    // Reuse the post ID to preserve Comment references
    await prisma.$queryRaw`
      INSERT INTO "Document" (
        id, title, slug, summary, content, "coverImage",
        published, "publishedAt", views, type,
        "authorId", "categoryId",
        "createdAt", "updatedAt"
      )
      VALUES (
        ${post.id},
        ${post.title},
        ${post.slug},
        ${post.summary},
        ${post.content},
        ${post.coverImage},
        ${post.published},
        ${post.publishedAt},
        ${post.views},
        'POST',
        ${post.authorId},
        ${newCategoryId},
        ${post.createdAt},
        ${post.updatedAt}
      )
    `;

    postCount++;
  }

  console.log(`✓ Migrated ${postCount} posts to Documents\n`);

  // Step 3: Migrate PostTag → DocumentTag
  console.log("Step 3: Migrating PostTag to DocumentTag...");
  const postTags = await prisma.$queryRaw<OldPostTag[]>`
    SELECT * FROM "PostTag"
  `;

  let tagCount = 0;

  for (const pt of postTags) {
    await prisma.$queryRaw`
      INSERT INTO "DocumentTag" ("documentId", "tagId")
      VALUES (${pt.postId}, ${pt.tagId})
    `;
    tagCount++;
  }

  console.log(`✓ Migrated ${tagCount} post-tag relations to DocumentTag\n`);

  // Step 4: Update Comment.postId → Comment.documentId
  console.log("Step 4: Updating Comment references...");

  // Check if Comment table has both columns (during transition)
  const commentColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Comment' AND column_name IN ('postId', 'documentId')
  `;

  const hasPostId = commentColumns.some((c) => c.column_name === "postId");
  const hasDocumentId = commentColumns.some((c) => c.column_name === "documentId");

  if (hasPostId && hasDocumentId) {
    // Copy postId to documentId
    await prisma.$queryRaw`
      UPDATE "Comment" SET "documentId" = "postId" WHERE "documentId" IS NULL
    `;
    console.log("✓ Copied Comment.postId to Comment.documentId\n");
  } else if (hasDocumentId && !hasPostId) {
    console.log("✓ Comment table already uses documentId\n");
  } else if (hasPostId && !hasDocumentId) {
    console.log("⚠ Comment table still has postId but no documentId. Schema push needed.\n");
  }

  console.log("Migration complete! Next steps:");
  console.log("1. Review the migrated data in your database");
  console.log("2. Run: npx prisma db push");
  console.log("3. The old Post, Category, PostTag tables will be dropped automatically");
  console.log("4. Run: npx prisma generate");
  console.log("5. Test the application thoroughly before deploying\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Migration failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
