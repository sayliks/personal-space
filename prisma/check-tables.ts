import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log("Tables in database:");
  for (const t of tables) {
    console.log("  -", t.tablename);
  }

  // Count rows in key tables
  const hasPost = tables.some((t) => t.tablename === "Post");
  const hasDocument = tables.some((t) => t.tablename === "Document");

  if (hasPost) {
    const [{ count }] = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::int as count FROM "Post"`;
    console.log(`\nPost rows: ${count}`);
  }
  if (hasDocument) {
    const [{ count }] = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::int as count FROM "Document"`;
    console.log(`Document rows: ${count}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Error:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
