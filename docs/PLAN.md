# my-blog Development Plan

Personal full-stack blog. Phases 0-11 complete, 48 tests passing.

## Tech Stack

Next.js 16 (App Router) / React 19 / Tailwind 4 / Prisma 7 / Auth.js v5 (Credentials + GitHub OAuth) / shadcn/ui

## Data Model

User, Post, Category, Tag, Comment (with replies). Post→Category, Post↔Tag, Post→Comment.

## Routes

**Public:** `/`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]`, `/search`, `/about`

**Admin:** `/admin/*` (guarded by `app/admin/layout.tsx`), `/login` (independent layout)

**API:** `/api/posts`, `/api/comments`, `/api/search`, `/api/graph`, `/api/auth/[...nextauth]`

## Architecture

- Prisma 7: client generated to `app/generated/prisma/`, import from that path; requires `PrismaPg` adapter
- Auth: JWT sessions, no middleware.ts (Edge Runtime incompatible with Prisma), runtime="nodejs" on auth routes
- i18n: next-intl 4, no URL prefix, cookie-driven (NEXT_LOCALE)
- Build: `export const dynamic = "force-dynamic"` on most public pages to avoid PgBouncer pool exhaustion

## Status

All phases complete. See `docs/refactoring.md` for AI Knowledge Workspace evolution plan.