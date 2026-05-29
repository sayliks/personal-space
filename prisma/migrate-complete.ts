/**
 * Phase 1 migration: Post/Category → Document model (NON-DESTRUCTIVE)
 *
 * Creates the new Document/DocumentTag/DocumentRelation tables and copies data
 * from the old tables. Old tables (Post, Category, PostTag) are LEFT IN PLACE
 * as a safety net. A separate script (drop-old-tables.ts) removes them after
 * you have verified the migration.
 *
 * Key design choices:
 * - Categories keep their existing id when becoming Documents, so Post.categoryId
 *   already points at the right row — no remapping needed.
 * - Posts keep their existing id, so Comment.postId values stay valid.
 * - Everything runs in a single transaction: it all succeeds or nothing changes.
 *
 * Usage: npx tsx prisma/migrate-complete.ts
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Phase 1 migration to Document model (non-destructive)...\n");

  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const tableNames = new Set(tables.map((t) => t.tablename));

  if (tableNames.has("Document")) {
    console.log("✓ Document table already exists. Nothing to do.");
    return;
  }
  if (!tableNames.has("Post") || !tableNames.has("Category")) {
    console.log("✗ Old tables (Post, Category) not found. Cannot migrate.");
    process.exit(1);
  }

  // Capture source counts up front so we can verify after.
  const [{ count: srcCategories }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "Category"`;
  const [{ count: srcPosts }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "Post"`;
  const [{ count: srcPostTags }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "PostTag"`;
  console.log(`Source data: ${srcCategories} categories, ${srcPosts} posts, ${srcPostTags} post-tags\n`);

  console.log("Starting transaction...\n");

  await prisma.$transaction(async (tx) => {
    // Step 1: Create enums
    console.log("Step 1: Creating enums...");
    await tx.$executeRaw`CREATE TYPE "DocumentType" AS ENUM ('POST', 'NOTE', 'PAGE', 'CATEGORY')`;
    await tx.$executeRaw`CREATE TYPE "RelationType" AS ENUM ('BACKLINK', 'REFERENCE', 'RELATED', 'QUOTE')`;
    console.log("✓ Enums created\n");

    // Step 2: Create Document table
    console.log("Step 2: Creating Document table...");
    await tx.$executeRaw`
      CREATE TABLE "Document" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "summary" TEXT,
        "content" TEXT,
        "coverImage" TEXT,
        "published" BOOLEAN NOT NULL DEFAULT false,
        "publishedAt" TIMESTAMP(3),
        "views" INTEGER NOT NULL DEFAULT 0,
        "type" "DocumentType" NOT NULL,
        "authorId" TEXT NOT NULL,
        "categoryId" TEXT,
        "parentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
      )
    `;
    await tx.$executeRaw`CREATE UNIQUE INDEX "Document_slug_key" ON "Document"("slug")`;
    await tx.$executeRaw`CREATE INDEX "Document_type_idx" ON "Document"("type")`;
    await tx.$executeRaw`CREATE INDEX "Document_published_createdAt_idx" ON "Document"("published", "createdAt" DESC)`;
    await tx.$executeRaw`CREATE INDEX "Document_categoryId_idx" ON "Document"("categoryId")`;
    await tx.$executeRaw`CREATE INDEX "Document_parentId_idx" ON "Document"("parentId")`;
    console.log("✓ Document table created\n");

    // Step 3: Create DocumentTag table
    console.log("Step 3: Creating DocumentTag table...");
    await tx.$executeRaw`
      CREATE TABLE "DocumentTag" (
        "documentId" TEXT NOT NULL,
        "tagId" TEXT NOT NULL,
        CONSTRAINT "DocumentTag_pkey" PRIMARY KEY ("documentId","tagId")
      )
    `;
    await tx.$executeRaw`CREATE INDEX "DocumentTag_tagId_idx" ON "DocumentTag"("tagId")`;
    console.log("✓ DocumentTag table created\n");

    // Step 4: Create DocumentRelation table
    console.log("Step 4: Creating DocumentRelation table...");
    await tx.$executeRaw`
      CREATE TABLE "DocumentRelation" (
        "id" TEXT NOT NULL,
        "fromDocumentId" TEXT NOT NULL,
        "toDocumentId" TEXT NOT NULL,
        "relationType" "RelationType" NOT NULL DEFAULT 'BACKLINK',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DocumentRelation_pkey" PRIMARY KEY ("id")
      )
    `;
    await tx.$executeRaw`CREATE INDEX "DocumentRelation_fromDocumentId_idx" ON "DocumentRelation"("fromDocumentId")`;
    await tx.$executeRaw`CREATE INDEX "DocumentRelation_toDocumentId_idx" ON "DocumentRelation"("toDocumentId")`;
    console.log("✓ DocumentRelation table created\n");

    // Step 5: Migrate Categories → Documents (reuse category IDs)
    console.log("Step 5: Migrating Categories to Documents...");
    await tx.$executeRaw`
      INSERT INTO "Document" (id, title, slug, type, published, "publishedAt", views, "authorId", "createdAt", "updatedAt")
      SELECT
        id,
        name,
        slug,
        'CATEGORY'::"DocumentType",
        true,
        "createdAt",
        0,
        (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1),
        "createdAt",
        "updatedAt"
      FROM "Category"
    `;
    const [{ count: catCount }] = await tx.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int as count FROM "Document" WHERE type = 'CATEGORY'
    `;
    console.log(`✓ Migrated ${catCount} categories (expected ${srcCategories})\n`);

    // Step 6: Migrate Posts → Documents (reuse post IDs, categoryId already points correctly)
    console.log("Step 6: Migrating Posts to Documents...");
    await tx.$executeRaw`
      INSERT INTO "Document" (id, title, slug, summary, content, "coverImage", published, "publishedAt", views, type, "authorId", "categoryId", "createdAt", "updatedAt")
      SELECT
        id,
        title,
        slug,
        summary,
        content,
        "coverImage",
        published,
        "publishedAt",
        views,
        'POST'::"DocumentType",
        "authorId",
        "categoryId",
        "createdAt",
        "updatedAt"
      FROM "Post"
    `;
    const [{ count: postCount }] = await tx.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int as count FROM "Document" WHERE type = 'POST'
    `;
    console.log(`✓ Migrated ${postCount} posts (expected ${srcPosts})\n`);

    // Step 7: Migrate PostTag → DocumentTag
    console.log("Step 7: Migrating PostTag to DocumentTag...");
    await tx.$executeRaw`
      INSERT INTO "DocumentTag" ("documentId", "tagId")
      SELECT "postId", "tagId" FROM "PostTag"
    `;
    const [{ count: tagCount }] = await tx.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int as count FROM "DocumentTag"
    `;
    console.log(`✓ Migrated ${tagCount} post-tag relations (expected ${srcPostTags})\n`);

    // Step 8: Update Comment table (add documentId, copy from postId, drop postId)
    console.log("Step 8: Updating Comment table...");
    await tx.$executeRaw`ALTER TABLE "Comment" ADD COLUMN "documentId" TEXT`;
    await tx.$executeRaw`UPDATE "Comment" SET "documentId" = "postId"`;
    await tx.$executeRaw`ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey"`;
    await tx.$executeRaw`ALTER TABLE "Comment" DROP COLUMN "postId"`;
    await tx.$executeRaw`ALTER TABLE "Comment" ALTER COLUMN "documentId" SET NOT NULL`;
    await tx.$executeRaw`DROP INDEX IF EXISTS "Comment_postId_idx"`;
    await tx.$executeRaw`CREATE INDEX "Comment_documentId_idx" ON "Comment"("documentId")`;
    console.log("✓ Updated Comment table\n");

    // Step 9: Add foreign keys
    console.log("Step 9: Adding foreign key constraints...");
    await tx.$executeRaw`ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "Document" ADD CONSTRAINT "Document_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "DocumentTag" ADD CONSTRAINT "DocumentTag_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "DocumentTag" ADD CONSTRAINT "DocumentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "DocumentRelation" ADD CONSTRAINT "DocumentRelation_fromDocumentId_fkey" FOREIGN KEY ("fromDocumentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "DocumentRelation" ADD CONSTRAINT "DocumentRelation_toDocumentId_fkey" FOREIGN KEY ("toDocumentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    await tx.$executeRaw`ALTER TABLE "Comment" ADD CONSTRAINT "Comment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
    console.log("✓ Foreign keys added\n");

    console.log("✅ Transaction committed successfully!");
  }, { timeout: 60000 });

  console.log("\n📊 Verification:");
  const [{ count: finalCategories }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "Document" WHERE type = 'CATEGORY'`;
  const [{ count: finalPosts }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "Document" WHERE type = 'POST'`;
  const [{ count: finalTags }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "DocumentTag"`;
  const [{ count: finalComments }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "Comment" WHERE "documentId" IS NOT NULL`;

  console.log(`  Categories: ${finalCategories} (source: ${srcCategories})`);
  console.log(`  Posts: ${finalPosts} (source: ${srcPosts})`);
  console.log(`  Post-tags: ${finalTags} (source: ${srcPostTags})`);
  console.log(`  Comments: ${finalComments}`);

  if (finalCategories !== srcCategories || finalPosts !== srcPosts || finalTags !== srcPostTags) {
    console.log("\n⚠️  Row counts don't match! Review the data before proceeding.");
  } else {
    console.log("\n✅ All row counts match!");
  }

  console.log("\n📝 Next steps:");
  console.log("1. Run: npx prisma generate");
  console.log("2. Restart dev server: npm run dev");
  console.log("3. Test the application thoroughly");
  console.log("4. Once verified, run: npx tsx prisma/drop-old-tables.ts");
  console.log("\n⚠️  Old tables (Post, Category, PostTag) are still in the database as a safety backup.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("\n❌ Migration failed (transaction rolled back, no changes applied):", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
