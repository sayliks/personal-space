/**
 * Drop old tables after Document migration is verified.
 *
 * Run this ONLY after:
 * 1. prisma/migrate-complete.ts has run successfully
 * 2. You have verified the app works with the new Document model
 *
 * This is DESTRUCTIVE and irreversible. The old Post, Category, and PostTag
 * tables (your safety backup) will be permanently removed.
 *
 * Usage: npx tsx prisma/drop-old-tables.ts
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const tableNames = new Set(tables.map((t) => t.tablename));

  if (!tableNames.has("Document")) {
    console.log("✗ Document table not found. Run migrate-complete.ts first.");
    process.exit(1);
  }

  // Safety check: ensure data was actually migrated before dropping source.
  const [{ count: postCount }] = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int as count FROM "Document" WHERE type = 'POST'
  `;
  if (tableNames.has("Post")) {
    const [{ count: srcPosts }] = await prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM "Post"`;
    if (postCount < srcPosts) {
      console.log(`✗ Document has ${postCount} posts but Post has ${srcPosts}. Migration incomplete — refusing to drop.`);
      process.exit(1);
    }
  }

  console.log("Dropping old tables (PostTag, Post, Category)...");
  await prisma.$executeRaw`DROP TABLE IF EXISTS "PostTag"`;
  await prisma.$executeRaw`DROP TABLE IF EXISTS "Post"`;
  await prisma.$executeRaw`DROP TABLE IF EXISTS "Category"`;
  console.log("✓ Old tables dropped. Migration fully complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Failed:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
