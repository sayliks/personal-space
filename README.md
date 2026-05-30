# A Personal Knowledge Space

A personal knowledge space — a quiet, long-term place where notes, essays, and
half-formed questions accumulate, link to each other, and get revisited over
time. It is built for **continuous refinement**, not one-shot publishing.

Most blog engines treat a post as finished the moment it ships. This treats a
note as something you return to: edits are surfaced, connections between ideas
are first-class, and the index reflects what you've recently *tended* rather
than only what you've recently published.

> Not a CMS, not a startup landing page, not a productivity dashboard. A system
> for thinking that becomes more valuable as it grows.

## What makes it a knowledge space

- **Wiki-links** — write `[[another note]]` (or `[[slug|alias]]`) in any note to
  link ideas directly, the way you'd cross-reference a notebook.
- **Backlinks** — every note shows which other notes point *to* it, so
  connections are bidirectional and discoverable.
- **Revision-aware notes** — a note edited meaningfully after publishing is
  marked as *tended*, with its updated date surfaced in lists and on the note
  itself. The space reads as actively maintained, not frozen.
- **Search & topics** — full-text search and category/tag navigation for
  finding your way back to an idea.
- **Knowledge graph data** — a `/api/graph` endpoint derives a graph from
  wiki-link references between notes (graph *visualization* is intentionally
  left out until a knowledge base is large enough to warrant it).
- **Comments with auth & moderation** — optional GitHub sign-in, admin approval
  flow, for discussion without turning the space into a social feed.
- **Bilingual** — Chinese (default) and English via cookie-based locale
  switching, no URL prefix.

## Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Database**: PostgreSQL, Prisma 7 (`@prisma/adapter-pg`)
- **Auth**: Auth.js v5 — Credentials + optional GitHub OAuth
- **UI**: shadcn/ui, Tailwind CSS v4
- **Content**: react-markdown + remark/rehype, syntax highlighting
- **i18n**: next-intl (zh / en)

## Quick start

**Prerequisites:** Node.js 20+, and a PostgreSQL database (any provider — local
Postgres, Docker, Supabase, Neon, etc.).

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env — see "Environment" below

# 3. Create the database schema
npx prisma db push

# 4. Seed your admin account (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env)
npm run seed

# 5. Start the dev server
npm run dev          # http://localhost:3000
```

Sign in at `/login` with the admin credentials you set, then write your first
note from the studio at `/admin`.

**Want to see it populated first?** Run `npm run seed:demo` (after `npm run
seed`) to load a small set of interlinked example notes. They demonstrate
wiki-links, backlinks, the tended/revision-aware marker, and how paths and
connections differ — and reading them is the fastest way to understand how the
space is meant to be used. The command is idempotent and only touches its own
demo notes, so it's safe to run on an existing database.

## Environment

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. A plain local or hosted Postgres needs only this one. |
| `DIRECT_URL` | no | Only needed behind a connection pooler (Supabase/PgBouncer): point `DATABASE_URL` at the pooled port and `DIRECT_URL` at the direct port. Leave unset for plain Postgres. |
| `AUTH_SECRET` | yes | Session encryption key, min 32 chars. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | no | Defaults to `http://localhost:3000`. |
| `ADMIN_EMAIL` | for seed | Login email created by `npm run seed`. |
| `ADMIN_PASSWORD` | for seed | Login password created by `npm run seed`. |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | no | Enables GitHub sign-in for comments. Omit to disable. |

Environment is validated at startup (`lib/env.ts`): in development it warns and
falls back, in production it fails fast on missing `DATABASE_URL` / `AUTH_SECRET`.

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint (flat config)
npm run test       # Jest unit/component tests
npm run test:e2e   # Playwright end-to-end tests
npm run seed       # create/update the admin user
npm run seed:demo  # load interlinked demo notes (run after seed)
```

Prisma: `npx prisma db push` (schema → DB), `npx prisma studio` (GUI),
`npx prisma generate` (runs automatically on install).

## Project structure

```
app/              # App Router pages, server actions, read-only API routes
  actions/        # mutations (server actions, not API routes)
  admin/          # the writing studio (auth-guarded)
components/       # UI — layout, blog (notes), admin
lib/              # prisma, auth, queries, validations, wiki-link, graph
messages/         # i18n strings (zh.json, en.json)
prisma/           # schema, seed
```

**Important:** The Prisma client is generated to `app/generated/prisma/` (not
`@prisma/client`). Always import from the generated path:
```typescript
import { PrismaClient } from "@/app/generated/prisma/client"
import type { Prisma } from "@/app/generated/prisma/client"
```

Reads go through `lib/queries.ts`; mutations are server actions in
`app/actions/`. See `CLAUDE.md` for the full architecture notes.

## Deployment

The app runs anywhere Node can reach PostgreSQL: Vercel, Docker, systemd,
a VPS, or anywhere else. No vendor lock-in.

**Quick Vercel:** Connect the repo, set environment variables in project
settings, deploy. Run `npx prisma db push` against your production database
before the first deploy.

**Self-hosting?** See [DEPLOY.md](DEPLOY.md) for Docker Compose and systemd
examples, plus verification steps.

## License

[MIT](LICENSE) © sayliks
