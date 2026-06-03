# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version warning

This project uses **Next.js 16.2.6** — APIs, conventions, and file structure differ from training data. Before writing any Next.js code, consult the docs bundled in `node_modules/next/dist/docs/`. Heed deprecation notices. Notably, Next.js 16 **renamed `middleware.ts` to `proxy.ts`** (see [proxy.ts](#proxyts-next-16-middleware) below).

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint 9 flat config
npm run test      # Jest unit/component tests (jsdom + Testing Library), in __tests__/
npm run test:e2e  # Playwright end-to-end tests, in e2e/
npm run seed      # Seed admin user (prisma/seed.ts via tsx)
npm run seed:demo # Seed demo content (prisma/seed-demo.ts)
```

Run a single Jest test: `npm run test -- __tests__/lib/slug.test.ts` (or `-t "<test name>"` to filter by name).

Prisma (Prisma 7):
```bash
npx prisma db push        # Push schema to database (no migration history)
npx prisma migrate dev    # Create & apply migration
npx prisma studio         # GUI
npx prisma generate       # Runs automatically via `postinstall`
```

`prisma/scripts/` holds **one-off** migration/exploration scripts (data migration to the Document model, table inspection). They are run manually via `tsx`, not part of the normal workflow.

## Stack

- **Framework**: Next.js 16 App Router, React 19
- **DB**: PostgreSQL on Supabase via Prisma 7 + `@prisma/adapter-pg`
- **Auth**: Auth.js v5 (next-auth beta) with Credentials + GitHub OAuth (conditional on env vars)
- **UI**: shadcn/ui (`base-nova` style, neutral base color), Tailwind CSS v4
- **Validation**: Zod 4
- **i18n**: next-intl 4 (zh default, en)
- **Theme**: single fixed warm-brown theme (no light/dark switching). The `dark` class is hardcoded on `<html>` in `app/layout.tsx`; `next-themes` has been removed. Theme tokens live in `app/globals.css` (`:root, .dark` share one brown palette anchored on `#2E1C0F`).
- **Markdown**: react-markdown + remark/rehype plugins (incl. KaTeX math)
- **Path alias**: `@/*` → project root

## Architecture

### Prisma client (Prisma 7 specifics)

- **Custom output path**: client is generated to `app/generated/prisma/` (gitignored; the `output` in `schema.prisma` is relative to the `prisma/` directory). Import the client as `import { PrismaClient } from "../app/generated/prisma/client"`, or types as `import type { Prisma } from "@/app/generated/prisma/client"`. Import from the **generated path, not `@prisma/client`** — the runtime client lives at the generated path.
- **Connection**: `prisma.config.ts` holds `datasource.url` (Prisma 7 removed `url`/`directUrl` from `schema.prisma`); it prefers `DIRECT_URL` and falls back to `DATABASE_URL`. Runtime uses the `PrismaPg` adapter — see `lib/prisma.ts`. The adapter is **required** in Prisma 7; constructing `new PrismaClient()` without one throws.
- **Singleton**: `lib/prisma.ts` caches on `globalThis` for HMR.
- **Two env URLs**: `DATABASE_URL` (pooled, port 6543, runtime) and `DIRECT_URL` (direct, port 5432). `prisma db push` / `migrate` should run over `DIRECT_URL` — DDL over the pooled PgBouncer port can hang.

### Data model: the unified `Document`

There is **no `Post` or `Category` model**. Posts, notes, pages, and categories are all rows in one `Document` table, discriminated by a `type` enum:

```
enum DocumentType { POST  NOTE  PAGE  CATEGORY }
```

- A post is `type: "POST"`; a **"quote"/daily-note is `type: "NOTE"`**; a category is `type: "CATEGORY"`.
- `Document.category` is a **self-relation** (`categoryId` → another Document of type CATEGORY). A separate self-relation `parent`/`children` (`DocumentTree`) supports nesting.
- **Tags are still their own model** (`Tag`) joined via `DocumentTag` (and `PhotoTag` for photos). Don't confuse tags with categories.
- `DocumentRelation` (`BACKLINK`/`REFERENCE`/`RELATED`/`QUOTE`) backs the knowledge-graph / backlinks feature.

Other models: `Photo` + `PhotoTag` (gallery), `Comment` (manual admin approval via `approved`), `PageView` (analytics), plus the standard Auth.js `User`/`Account`/`Session`.

### Data layer (`lib/queries.ts`)

Pages **do not call Prisma directly**. All read queries live in `lib/queries.ts` and reuse a shared `DOCUMENT_INCLUDES` constant. The post type is derived via `Prisma.DocumentGetPayload<{ include: typeof DOCUMENT_INCLUDES }>` (exported as `PostWithRelations`) — never hand-write document/comment types. Most queries filter by `type` (e.g. `getHomePosts` → `type: "POST"`, `getHomeQuotes` → `type: "NOTE"`, `getAllCategories` → `type: "CATEGORY"`).

`withTransientRetry()` wraps a few hot queries: it retries once on transient Prisma/connection errors, and several queries additionally `.catch()` to an empty fallback so a flaky DB degrades gracefully instead of throwing.

### Mutations: Server Actions (with one analytics exception)

Most mutations are **Server Actions** in `app/actions/`, each marked `"use server"`. There are **five** files:

- `posts.ts` — `createPost`, `updatePost`, `deletePost`. Defines and **exports** the canonical `ActionResult` type.
- `quotes.ts` — `createQuote`, `updateQuote`, `deleteQuote`, plus `uploadQuoteImage` (imports `ActionResult` from `./posts`).
- `photos.ts` — `createPhoto`, `updatePhoto`, `deletePhoto`.
- `comments.ts` — `createComment` (public; defines its own `ActionResult`).
- `admin.ts` — `createCategory`/`deleteCategory`, `createTag`/`deleteTag`, `approveComment`/`deleteComment`.

Two coexisting calling patterns — match the file you're editing:

1. **Result-returning** (`posts.ts`, `quotes.ts`, `photos.ts`, `comments.ts`): returns `ActionResult` (`{ success: true } | { success: false; error }`). Called **imperatively** from client components that build `FormData` and handle the result. **Note the error shape differs**: `posts`/`quotes`/`comments` return `error: string` (surfacing `result.error.issues[0].message` on Zod failure); `photos.ts` returns `error: { issues: [...] }`.
2. **Fire-and-forget** (`admin.ts`): returns `void`, silently `return`s on validation failure, wired via `<form action={fn}>` in server components.

Auth guard: each file defines its own local `requireAdmin()` that calls `await auth()` and throws `"Unauthorized"`. `posts.ts`/`quotes.ts` check `role === "admin"` **and** `user.id`; `admin.ts`/`photos.ts` check role only. `createComment` calls `auth()` but allows anonymous comments. Every action calls `revalidatePath(...)` after mutating.

`uploadQuoteImage` writes files to the **local filesystem** under `public/uploads/quotes/YYYY/MM/`. This requires a persistent disk — it will not survive on ephemeral/serverless hosting.

**Auth is not a Server Action** — sign-in/sign-out use `next-auth/react` directly in client components (`login/page.tsx`, `CommentForm.tsx`, `AdminLayoutClient.tsx`).

**The exception to "mutations are Server Actions"**: analytics writes go through the API route `POST /api/analytics/track`, which inserts a `PageView`. It is invoked by `proxy.ts`, not from a form.

### `proxy.ts` (Next 16 middleware)

`proxy.ts` at the repo root is Next.js 16's middleware (the renamed `middleware.ts`). It matches all non-static paths and, for public pages only (skips `/api`, `/_next`, `/admin`, `/login`, static assets), fires a **non-blocking** `fetch` to `/api/analytics/track` to record a page view. It forwards client IP and geo headers (Vercel/Cloudflare) as `x-analytics-*` headers and swallows errors so page loads are never blocked.

**Auth is deliberately NOT done here.** Auth.js middleware needs the Edge runtime, which is incompatible with the Prisma + pg adapter; `proxy.ts` only reads headers and does a fetch (no Prisma), so it stays Edge-safe. The admin auth guard remains in `app/admin/layout.tsx`.

### Comment approval

`createComment` persists every comment with `approved: false`; an admin approves it from the review queue (`app/admin/comments`). There is no automated moderation — approval is fully manual.

### Validation boundaries

- **Env**: `lib/env.ts` validates `process.env` with Zod at import time. It warns + falls back rather than throwing (visible but non-fatal), **except** in production where missing `DATABASE_URL` or a `< 32` char `AUTH_SECRET` throws fatally. Optional vars: `DIRECT_URL`, `AUTH_GITHUB_ID/SECRET`, `ANALYTICS_GEOLOOKUP`.
- **Mutation input**: `lib/validations.ts` exports Zod schemas (`createPostSchema`, `createQuoteSchema`, `createCommentSchema`, `createCategorySchema`, `createTagSchema`, `createPhotoSchema`). Server Actions `safeParse()` `FormData` before touching Prisma. `createPhotoSchema.imageUrl` transforms input, extracting the URL from Markdown `![](url)` or `<img src>` before validating it as a URL.

### Auth (Auth.js v5)

- Config: `lib/auth.ts`. Strategy: JWT sessions (not database sessions despite `PrismaAdapter` being attached).
- Admin protection is in `app/admin/layout.tsx` (`await auth()` + `redirect("/login")`), **not** middleware — see [proxy.ts](#proxyts-next-16-middleware).
- Admin routes and the auth API route declare `export const runtime = "nodejs"` explicitly.
- `/login` lives at `app/login/` with its **own** layout, **not** under `app/admin/` — placing it inside admin caused redirect loops with the layout guard.
- Sign-in pages: `pages: { signIn: "/login" }` in the NextAuth config.

### i18n (next-intl, cookie-driven)

- **No URL locale prefix**. Locale resolution happens in `i18n/request.ts`:
  1. Read `NEXT_LOCALE` cookie
  2. Fallback: parse `Accept-Language` header
  3. Default: `zh` (see `i18n/routing.ts`)
- Switching languages writes the cookie and calls `router.refresh()` — there is no `[locale]` segment in the route tree.
- `next.config.ts` wraps the config with `createNextIntlPlugin()`.
- Messages live in `messages/{en,zh}.json` across ~15 namespaces (`common, about, search, post, admin, footer, notFound, error, pagination, categories, tags, posts, home, studio, auth`).
- Server components: `getTranslations("namespace")` from `next-intl/server`. Client components: `useTranslations()`.
- `generateMetadata` functions use `getTranslations` for localised SEO metadata.

### Public pages and build-time DB connections

Most public pages (categories, tags, search, homepage) declare `export const dynamic = "force-dynamic"`. **Why**: at build time, Next.js spawns many workers prerendering pages — each opens a Prisma connection, exhausting the Supabase PgBouncer pool. `force-dynamic` skips prerendering and avoids pool exhaustion. Post detail uses `revalidate = 3600` with `generateStaticParams` for SSG.

### Routes

- **Public**: `/`, `/posts`, `/posts/[slug]`, `/categories/[slug]`, `/tags/[slug]`, `/search`, `/about`, `/gallery`, `/sitemap.xml`
- **Admin** (guarded by `app/admin/layout.tsx`): `/admin`, `/admin/posts` (`+ /new`, `/[id]/edit`), `/admin/quotes` (`+ /new`, `/[id]/edit`), `/admin/photos` (`+ /new`, `/[id]/edit`), `/admin/categories`, `/admin/tags`, `/admin/comments`, `/admin/analytics`
- **Auth**: `/login` (independent layout), `/api/auth/[...nextauth]`
- **API**: `/api/search` (read), `/api/analytics/track` (write, called by `proxy.ts`). Other mutations are Server Actions.
- **No graph route or component** — the knowledge-graph view was removed; backlinks/related-notes render via `components/blog/Backlinks.tsx` and `RelatedNotes.tsx`.
- **No RSS feed** — `app/rss.xml/` was removed; the sitemap (`app/sitemap.ts`) is retained.

### Analytics

- Recording: `proxy.ts` → `POST /api/analytics/track` → `prisma.pageView.create`.
- Geo/IP resolution: `lib/geoip.ts` extracts the client IP from proxy headers, skips non-public IPs, prefers platform geo headers (Vercel/Cloudflare), and otherwise looks up `ipapi.co` (in-memory cache, 1s timeout). Disable network lookups with `ANALYTICS_GEOLOOKUP=false`.
- Aggregation for the dashboard: `lib/analytics.ts` (`getAnalyticsStats`, `getVisitorsByDay`).

### shadcn/ui

`components.json` is configured (style `base-nova`, base color neutral, lucide icons). Add components with `npx shadcn add <name>`. UI primitives live in `components/ui/`; product components in `components/{layout,blog,admin,auth}/`.

### Markdown rendering

`react-markdown` + `remark-gfm` + `remark-math` + `rehype-raw` + `rehype-highlight` + `rehype-katex` + `rehype-slug` + a custom `remark-wiki-link`, styled via `@tailwindcss/typography` (`prose`). Renderer: `components/blog/MarkdownRenderer.tsx`. KaTeX math is supported (`remark-math` + `rehype-katex`).

Wiki-link syntax (`[[target|alias]]`) is supported. The regex and `extractWikiLinks()` live in `lib/wiki-link.ts` — import from there (not redefined elsewhere). The remark plugin (`lib/remark-wiki-link.ts`) converts `[[text]]` to `<a class="wiki-link">`. CSS for `.wiki-link` is in `app/globals.css`.

## Conventions

- New write operations: prefer a Server Action in `app/actions/`, guard with `requireAdmin()`/`auth()`, validate with the Zod schemas in `lib/validations.ts`, and `revalidatePath()` affected routes. Only add an API route for writes that can't be a form action (e.g. the `proxy.ts`-triggered analytics ping).
- New data reads: add to `lib/queries.ts`; don't call Prisma from pages/components. Filter Documents by `type`.
- New admin pages: rely on the layout's `auth()` guard — don't re-check auth in the page.
- New UI strings: add keys to **both** `messages/en.json` and `messages/zh.json`.
- Prisma client imports: from the generated path, never `@prisma/client`.

## Reference

- `docs/DEPLOY.md` — deployment guide (Docker Compose, systemd, managed Postgres).
- `AGENTS.md` — condensed agent-facing summary of this file (keep roughly in sync when architecture changes).
