# my-blog Development Plan

Personal full-stack blog. Phases 0-11 complete, 48 tests passing.

## Tech Stack

Next.js 16 (App Router) / React 19 / Tailwind 4 / Prisma 7 / Auth.js v5 (Credentials + GitHub OAuth) / shadcn/ui

## Data Model

User, Document (POST/NOTE/PAGE/CATEGORY), Tag, DocumentTag, DocumentRelation, Comment (with replies). Document→Category (self), Document↔Tag, Document→Comment.

## Routes

**Public:** `/`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]`, `/search`, `/about`

**Admin:** `/admin/*` (guarded by `app/admin/layout.tsx`), `/login` (independent layout)

**API:** `/api/search`, `/api/graph`, `/api/auth/[...nextauth]` (writes use Server Actions)

## Architecture

- Prisma 7: client generated to `app/generated/prisma/`, import from that path; requires `PrismaPg` adapter
- Auth: JWT sessions, no middleware.ts (Edge Runtime incompatible with Prisma), runtime="nodejs" on auth routes
- i18n: next-intl 4, no URL prefix, cookie-driven (NEXT_LOCALE)
- Build: `export const dynamic = "force-dynamic"` on most public pages to avoid PgBouncer pool exhaustion

## Migration Runbook (Post/Category → Document)

1. Backup the database and test on a copy first.
2. Ensure the Document tables exist while old Post/Category/PostTag tables are still present.
3. Run `npx tsx prisma/migrate-to-documents.ts` to copy data into Document/DocumentTag and update Comment references.
4. Apply the final schema to drop old tables, then run `npx prisma generate`.
5. Verify the app and data before deploying.

## Status

All phases complete. See `docs/refactoring.md` for AI Knowledge Workspace evolution plan.