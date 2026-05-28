# Copilot instructions — frostsalix/my-blog

## Quick commands

- Install & seed:
  - npm install
  - cp .env.example .env    # fill required envs
  - npx prisma db push
  - npm run seed
- Dev / build / start:
  - npm run dev
  - npm run build
  - npm run start
- Lint: npm run lint    # ESLint 9 (flat config)
- Unit tests: npm run test (Jest)
  - Run a single Jest file: npx jest path/to/file.test.ts
  - Run a single test by name: npx jest path/to/file.test.ts -t "test name"
- E2E tests (Playwright): npm run test:e2e
  - Run a single Playwright spec: npx playwright test path/to/spec.ts
  - Filter by test title: npx playwright test -g "test title"
- Postinstall: npm run postinstall (runs `prisma generate`)

## High-level architecture (big picture)

- Next.js App Router (app/) with server and client components.
- UI: components/ (shadcn/ui primitives under components/ui/; product components under components/{layout,blog,admin}).
- Data layer: Prisma 7 + Postgres (Supabase). Client is generated to `app/generated/prisma/` — imported from that path only.
- Core shared code: lib/ — prisma.ts, auth.ts, queries.ts, validations.ts, wiki-link utilities, markdown helpers.
- i18n: next-intl, cookie-driven (NEXT_LOCALE). No locale route prefixes.
- Auth: Auth.js v5 with JWT sessions. Admin guard implemented in `app/admin/layout.tsx` (no middleware.ts).
- Most public pages use `export const dynamic = "force-dynamic"` to avoid creating many DB connections at build time.

See README.md, CLAUDE.md, AGENTS.md, and docs/PLAN.md for deeper context.

## Key conventions (explicit, not obvious)

- Prisma client import: always import from the generated path, e.g.
  - import { PrismaClient } from "../app/generated/prisma/client"
  - import type { Prisma } from "@/app/generated/prisma/client"
  - Do NOT import from `@prisma/client`.
- Prisma 7 requires the PrismaPg adapter; runtime uses two URLs: `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) — check lib/prisma.ts and prisma.config.ts.
- Data reads must be added to `lib/queries.ts`. Pages/components should not call Prisma directly.
- API input: validate with Zod schemas in `lib/validations.ts`; return 400 on schema failure.
- Admin routes rely on `app/admin/layout.tsx` for auth; do not add redundant guards in admin pages.
- New UI strings: add keys to both `messages/en.json` and `messages/zh.json`.
- Markdown/wiki-links: use lib/wiki-link.ts and lib/remark-wiki-link.ts (wiki-link syntax `[[target|alias]]`).
- Tests: unit tests via Jest, E2E via Playwright. Use the npm scripts in package.json for CI.

## Where to look (quick references)
- README.md — getting started
- AGENTS.md / CLAUDE.md — repo-specific constraints (Prisma client path, dynamic rendering, i18n, auth guard)
- docs/PLAN.md — architecture and data model
- lib/ (queries.ts, validations.ts) and prisma/ (schema, seed)

---

(If this file already existed, improvements were suggested by consolidating commands and adding the explicit Prisma/client and rendering constraints.)
