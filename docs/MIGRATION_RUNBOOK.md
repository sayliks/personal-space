# Phase 1 Migration Runbook: Post/Category → Document Model

This runbook guides you through migrating your existing blog data from the Post/Category/Tag structure to the unified Document model.

## Overview

**What changes:**
- `Post` table → `Document` table (with `type: "POST"`)
- `Category` table → `Document` table (with `type: "CATEGORY"`)
- `PostTag` table → `DocumentTag` table
- `Comment.postId` → `Comment.documentId`

**What stays the same:**
- All post IDs are preserved (SEO-safe, no broken links)
- All tags remain unchanged
- All comments remain unchanged (just reference documentId instead)
- User accounts and auth unchanged

## Prerequisites

1. **Backup your database** before proceeding
   ```bash
   # For Supabase, use their dashboard to create a backup
   # Or use pg_dump if you have direct access:
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Verify you're on the feature branch:**
   ```bash
   git branch --show-current
   # Should show: feature/ai-workspace-phase1
   ```

3. **Ensure dependencies are installed:**
   ```bash
   npm install
   ```

## Migration Steps

### Step 1: Run the data migration script

This script reads existing data from Post/Category/PostTag tables and writes to the new Document/DocumentTag tables. It uses raw SQL to read old tables, so it works even after schema changes.

```bash
npx tsx prisma/migrate-to-documents.ts
```

**Expected output:**
```
Starting migration to Document model...
Found old tables: Post, Category, PostTag

Step 1: Migrating Categories to Documents...
✓ Migrated X categories to Documents

Step 2: Migrating Posts to Documents...
✓ Migrated X posts to Documents

Step 3: Migrating PostTag to DocumentTag...
✓ Migrated X post-tag relations to DocumentTag

Step 4: Updating Comment references...
✓ Copied Comment.postId to Comment.documentId

Migration complete!
```

**If the script fails:**
- Check the error message carefully
- Verify DATABASE_URL is correct in your .env
- Ensure you have write permissions to the database
- Check that old tables still exist (Post, Category, PostTag)

### Step 2: Push the new schema

This updates your database schema to match the new Document model and drops the old Post/Category/PostTag tables.

```bash
npx prisma db push
```

**You will see warnings about data loss** — this is expected because we're dropping the old tables. The data has already been migrated to the new tables in Step 1.

**Expected prompts:**
```
⚠️  We found changes that cannot be executed:
  • Tables to be dropped: Post, Category, PostTag

? Do you want to continue? › (y/N)
```

Type `y` and press Enter.

**Expected output:**
```
✔ Generated Prisma Client
The database is now in sync with your Prisma schema.
```

### Step 3: Regenerate Prisma Client

```bash
npx prisma generate
```

This ensures the TypeScript types match the new schema.

### Step 4: Verify the migration

Run these queries in your database to verify data integrity:

```sql
-- Check document counts by type
SELECT type, COUNT(*) FROM "Document" GROUP BY type;
-- Expected: POST (your post count), CATEGORY (your category count)

-- Check all posts have authors
SELECT COUNT(*) FROM "Document" WHERE type = 'POST' AND "authorId" IS NULL;
-- Expected: 0

-- Check all comments reference valid documents
SELECT COUNT(*) FROM "Comment" c
LEFT JOIN "Document" d ON c."documentId" = d.id
WHERE d.id IS NULL;
-- Expected: 0

-- Check document-tag relations
SELECT COUNT(*) FROM "DocumentTag";
-- Expected: same count as old PostTag table
```

### Step 5: Test the application

```bash
npm run dev
```

Visit these pages and verify they work:
- Homepage: `http://localhost:3000`
- Post detail: `http://localhost:3000/posts/[any-slug]`
- Category page: `http://localhost:3000/categories/[any-slug]`
- Tag page: `http://localhost:3000/tags/[any-slug]`
- Admin posts: `http://localhost:3000/admin/posts`
- Admin categories: `http://localhost:3000/admin/categories`
- Admin tags: `http://localhost:3000/admin/tags`
- Admin comments: `http://localhost:3000/admin/comments`

**Test creating new content:**
1. Create a new category (should create a Document with type: CATEGORY)
2. Create a new post (should create a Document with type: POST)
3. Add a comment to a post (should reference documentId)

### Step 6: Run tests

```bash
npm run test
```

All tests should pass. If any fail, review the error messages.

### Step 7: Build for production

```bash
npm run build
```

Verify the build completes without errors.

## Rollback Plan

If something goes wrong and you need to rollback:

### Option 1: Restore from backup (recommended)

```bash
# Restore the database backup you created in Prerequisites
psql $DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql
```

### Option 2: Revert code changes

```bash
# Switch back to main branch
git checkout main

# Regenerate Prisma client for old schema
npx prisma generate

# Restart dev server
npm run dev
```

**Note:** Option 2 only works if you haven't run `prisma db push` yet. Once you push the new schema and drop the old tables, you must restore from backup.

## Post-Migration Checklist

- [ ] All pages load without errors
- [ ] Can create new posts
- [ ] Can create new categories
- [ ] Can add comments to posts
- [ ] Admin pages work correctly
- [ ] Search works
- [ ] Knowledge graph works
- [ ] Tests pass
- [ ] Production build succeeds
- [ ] Backup of old database is stored safely

## Troubleshooting

### "Table 'Post' does not exist"

You ran `prisma db push` before running the migration script. Restore from backup and follow the steps in order.

### "Unique constraint violation on Document.slug"

A post and category have the same slug. The migration script should handle this, but if it doesn't, manually update one of the slugs before re-running.

### "Foreign key constraint violation"

A comment references a post that doesn't exist, or a post references a category that doesn't exist. Clean up orphaned records before migrating:

```sql
-- Find orphaned comments
SELECT * FROM "Comment" c
LEFT JOIN "Post" p ON c."postId" = p.id
WHERE p.id IS NULL;

-- Delete orphaned comments (if any)
DELETE FROM "Comment" WHERE "postId" NOT IN (SELECT id FROM "Post");
```

### Build fails with "Property 'post' does not exist"

Some component still references the old `post` field. Search for `comment.post` and replace with `comment.document`.

## Next Steps

After successful migration:

1. **Deploy to production** (follow your normal deployment process)
2. **Monitor for errors** in the first 24 hours
3. **Phase 2 preparation**: pgvector extension, embeddings, AI summaries (separate iteration)

## Support

If you encounter issues not covered in this runbook:
- Check the git commit history for context on each change
- Review the Prisma schema in `prisma/schema.prisma`
- Check the migration script in `prisma/migrate-to-documents.ts`
