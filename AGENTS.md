# AGENTS.md

## Setup
```bash
npm install && cp .env.example .env  # Fill DATABASE_URL, DIRECT_URL, AUTH_SECRET
npx prisma db push && npm run seed    # Seed admin user
npm run dev
```

## Commands
| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint 9 (flat config) |
| `npm run seed` | Create admin user via tsx |
| `npm run test` | Jest tests |
| `npm run test:e2e` | Playwright tests |

## Stack
- Next.js 16.2.6 / React 19 / Tailwind 4
- Prisma 7 with `@prisma/adapter-pg` (Postgres/Supabase)
- Auth.js v5 (JWT sessions, Credentials + GitHub OAuth)
- shadcn/ui (`base-nova` style, neutral color)
- next-intl 4 (zh default, en)

## Critical Constraints

### Prisma Client Import
**Import from generated path only:** `from "../app/generated/prisma/client"` or `from "@/app/generated/prisma/client"`. Never `@prisma/client` — it doesn't exist.

### Dynamic Rendering for Pool Safety
Most public pages declare `export const dynamic = "force-dynamic"` — prevents ~24 concurrent build-time Prisma connections from exhausting Supabase PgBouncer (limit 15).

### Auth Guard Location
No `middleware.ts`. Admin routes guard via `app/admin/layout.tsx` calling `auth()` + `redirect("/login")`. Auth API routes declare `export const runtime = "nodejs"` explicitly.

### i18n (No URL prefix)
Locale resolved from `NEXT_LOCALE` cookie → `Accept-Language` header → default `zh`. No `[locale]` route segments. Switch languages: set cookie + `router.refresh()`.

## Architecture
- `app/` — App Router pages & API routes
- `components/` — UI: `ui/` (primitives), `layout/`, `blog/`, `admin/`
- `lib/` — Shared: `prisma.ts`, `auth.ts`, `queries.ts`, `validations.ts`, `env.ts`, `wiki-link.ts`
- `messages/` — i18n: `en.json`, `zh.json` (~13 namespaces)
- `prisma/` — Schema, seed, migrations

## Conventions
- API input: validate with Zod schemas in `lib/validations.ts`
- Data reads: add to `lib/queries.ts`, use `POST_INCLUDES` constant
- Admin pages: rely on layout guard, don't re-check auth
- New strings: add to both `messages/en.json` and `messages/zh.json`

## Reference
- `docs/PLAN.md` — architecture roadmap (Phase 0–11 completed)