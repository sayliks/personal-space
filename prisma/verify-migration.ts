import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Phase 1 Migration Verification ===\n");

  // 1. Check document counts by type
  const [{ categories }] = await prisma.$queryRaw<Array<{ categories: number }>>`
    SELECT COUNT(*)::int as categories FROM "Document" WHERE type = 'CATEGORY'
  `;
  const [{ posts }] = await prisma.$queryRaw<Array<{ posts: number }>>`
    SELECT COUNT(*)::int as posts FROM "Document" WHERE type = 'POST'
  `;
  console.log(`Documents by type:`);
  console.log(`  Categories: ${categories}`);
  console.log(`  Posts: ${posts}`);
  console.log(`  Total: ${categories + posts}\n`);

  // 2. Check for orphaned references
  const orphanedCommentsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "Comment" c
    LEFT JOIN "Document" d ON c."documentId" = d.id
    WHERE d.id IS NULL
  `;
  const orphanedComments = Number(orphanedCommentsResult[0].count);
  console.log(`Orphaned comments: ${orphanedComments}`);

  const orphanedPostsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "Document" p
    LEFT JOIN "Document" c ON p."categoryId" = c.id
    WHERE p."categoryId" IS NOT NULL AND c.id IS NULL
  `;
  const orphanedPosts = Number(orphanedPostsResult[0].count);
  console.log(`Posts with invalid categoryId: ${orphanedPosts}\n`);

  // 3. Check document-tag relations
  const tagRelationsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "DocumentTag"
  `;
  const tagRelations = Number(tagRelationsResult[0].count);
  console.log(`Document-tag relations: ${tagRelations}\n`);

  // 4. Sample documents
  console.log("Sample documents:");
  const docs = await prisma.document.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, type: true, slug: true, published: true },
  });
  for (const doc of docs) {
    console.log(`  [${doc.type}] ${doc.title} (${doc.slug}) - ${doc.published ? "published" : "draft"}`);
  }

  // 5. Check for potential issues
  console.log("\n=== Potential Issues ===");

  // Duplicate slugs
  const duplicateSlugs = await prisma.$queryRaw<Array<{ slug: string; count: number }>>`
    SELECT slug, COUNT(*)::int as count FROM "Document"
    GROUP BY slug HAVING COUNT(*) > 1
  `;
  if (duplicateSlugs.length > 0) {
    console.log("⚠️  Duplicate slugs found:");
    for (const dup of duplicateSlugs) {
      console.log(`  - ${dup.slug} (${dup.count} documents)`);
    }
  } else {
    console.log("✓ No duplicate slugs");
  }

  // Documents without authors
  const noAuthorResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "Document" WHERE "authorId" IS NULL
  `;
  const noAuthor = Number(noAuthorResult[0].count);
  if (noAuthor > 0) {
    console.log(`⚠️  ${noAuthor} documents without authors`);
  } else {
    console.log("✓ All documents have authors");
  }

  // Categories with invalid structure
  const invalidCategoriesResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "Document"
    WHERE type = 'CATEGORY' AND ("categoryId" IS NOT NULL OR "parentId" IS NOT NULL)
  `;
  const invalidCategories = Number(invalidCategoriesResult[0].count);
  if (invalidCategories > 0) {
    console.log(`⚠️  ${invalidCategories} categories with invalid parent/category references`);
  } else {
    console.log("✓ Categories have valid structure");
  }

  console.log("\n=== Summary ===");
  if (orphanedComments === 0 && orphanedPosts === 0 && duplicateSlugs.length === 0 && noAuthor === 0 && invalidCategories === 0) {
    console.log("✅ No issues found. Migration is healthy.");
  } else {
    console.log("⚠️  Issues detected. Review above for details.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Error:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
