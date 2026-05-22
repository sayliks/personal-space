# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version warning

This project uses **Next.js 16.2.6** — APIs, conventions, and file structure may differ from training data. Before writing any Next.js code, consult the docs bundled in `node_modules/next/dist/docs/`. Heed deprecation notices. (See `AGENTS.md`.)

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint 9 flat config
npm run seed     # Seed admin user (prisma/seed.ts via tsx)
```

Prisma (Prisma 7):
```bash
npx prisma db push        # Push schema to database (no migration history)
npx prisma migrate dev    # Create & apply migration
npx prisma studio         # GUI
npx prisma generate       # Runs automatically via `postinstall`
```

## Stack

- **Framework**: Next.js 16 App Router, React 19
- **DB**: PostgreSQL on Supabase via Prisma 7 + `@prisma/adapter-pg`
- **Auth**: Auth.js v5 (next-auth beta) with Credentials provider + bcryptjs
- **UI**: shadcn/ui (`base-nova` style, neutral base color), Tailwind CSS v4
- **Validation**: Zod 4
- **i18n**: next-intl 4 (zh default, en)
- **Theme**: next-themes (class strategy, `system` default)
- **Path alias**: `@/*` → project root

## Architecture

### Prisma client (Prisma 7 specifics)

- **Custom output path**: client is generated to `app/generated/prisma/` (gitignored). Import the client as `import { PrismaClient } from "../app/generated/prisma/client"` or types as `import type { Prisma } from "@/app/generated/prisma/client"`. **Do NOT import from `@prisma/client`** — it won't exist.
- **Connection**: `prisma.config.ts` holds the `datasource.url` (Prisma 7 removed `url`/`directUrl` from `schema.prisma`). Runtime uses the `PrismaPg` adapter — see `lib/prisma.ts`. The adapter is **required** in Prisma 7; constructing `new PrismaClient()` without one throws.
- **Singleton**: `lib/prisma.ts` caches on `globalThis` for HMR.
- **Two env URLs**: `DATABASE_URL` (pooled, port 6543, runtime) and `DIRECT_URL` (direct, port 5432, optional fallback).

### Data layer (`lib/queries.ts`)

Pages **do not call Prisma directly**. All read queries live in `lib/queries.ts` and reuse a shared `POST_INCLUDES` constant. Types are derived via `Prisma.PostGetPayload<{ include: typeof POST_INCLUDES }>` — never hand-write post/comment types.

### Validation boundaries

- **Env**: `lib/env.ts` validates `process.env` with Zod at import time. It warns + falls back rather than throwing, so failures are visible but non-fatal.
- **API input**: `lib/validations.ts` exports Zod schemas (`createPostSchema`, `createCommentSchema`, etc). API routes use `schema.safeParse()` and return 400 with `error.flatten()` on failure.

### Auth (Auth.js v5)

- Config: `lib/auth.ts`. Strategy: JWT sessions (not database sessions despite `PrismaAdapter` being attached).
- **No `middleware.ts`** — Auth.js middleware requires Edge Runtime, which is incompatible with the Prisma + pg adapter. Instead, `app/admin/layout.tsx` calls `await auth()` and `redirect("/login")` for unauthenticated users.
- Admin routes and the auth API route declare `export const runtime = "nodejs"` explicitly.
- `/login` lives at `app/login/`, **not** under `app/admin/` — placing it inside admin caused redirect loops with the layout guard.
- Sign-in pages: `pages: { signIn: "/login" }` in the NextAuth config.

### i18n (next-intl, cookie-driven)

- **No URL locale prefix**. Locale resolution happens in `i18n/request.ts`:
  1. Read `NEXT_LOCALE` cookie
  2. Fallback: parse `Accept-Language` header
  3. Default: `zh` (see `i18n/routing.ts`)
- Switching languages writes the cookie and calls `router.refresh()` — there is no `[locale]` segment in the route tree.
- `next.config.ts` wraps the config with `createNextIntlPlugin()`.
- Messages live in `messages/{en,zh}.json` organised into ~13 namespaces.
- Server components: use `getTranslations("namespace")` from `next-intl/server`. Client components: `useTranslations()`.
- `generateMetadata` functions use `getTranslations` for localised SEO metadata.

### Public pages and build-time DB connections

Public pages (home, posts, categories, tags, search) declare `export const dynamic = "force-dynamic"`. **Why**: at build time, Next.js spawns ~24 workers prerendering pages — each opens a Prisma connection, exhausting the Supabase PgBouncer pool (limit 15). `force-dynamic` skips prerendering and avoids the pool exhaustion. Removing it will break `npm run build`.

### Routes

- Public: `/`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]`, `/search`, `/about`, `/sitemap.xml`
- Admin (guarded by `AdminLayout`): `/admin`, `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]/edit`, `/admin/categories`, `/admin/tags`, `/admin/comments`
- Auth: `/login` (independent layout), `/api/auth/[...nextauth]`
- API: `/api/posts`, `/api/comments`, `/api/search`
- **No RSS feed** — `app/rss.xml/` was removed in `f2390b4`. Sitemap (`app/sitemap.ts`) is retained.

### shadcn/ui

`components.json` is configured (style `base-nova`, base color neutral, lucide icons). Add components with `npx shadcn add <name>`. UI primitives live in `components/ui/`; product components in `components/{layout,blog,admin}/`.

### Markdown rendering

`react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-slug`, styled via `@tailwindcss/typography` (`prose` classes). Renderer is `components/blog/MarkdownRenderer.tsx`.

## Conventions

- New API routes: validate input with the Zod schemas in `lib/validations.ts` (don't trust the JSON body).
- New data reads: add to `lib/queries.ts`, don't call Prisma from pages/components.
- New admin pages: rely on the layout's `auth()` guard — don't re-check auth in the page.
- New strings shown in UI: add keys to **both** `messages/en.json` and `messages/zh.json`.
- Prisma client imports: from the generated path, never `@prisma/client`.

## Reference

- `docs/PLAN.md` — full project roadmap with phase status (Phase 0–8 done, Phase 9 testing pending) and the senior-engineer learning notes the project follows.
