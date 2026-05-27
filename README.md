# sayliks's blog

A personal full-stack blog with an Obsidian-style knowledge graph, built with Next.js 16.

## Features

- Markdown articles with syntax highlighting and wiki-link support (`[[target|alias]]`)
- Obsidian-style force-directed knowledge graph on the homepage
- Backlinks panel on each post
- Comments with threaded replies (supports GitHub OAuth login)
- Full-text search
- Dark mode (system / light / dark)
- Bilingual UI (zh / en), cookie-driven, no URL prefix
- Admin dashboard for posts, categories, tags, and comment moderation

## Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Database**: PostgreSQL on Supabase, Prisma 7
- **Auth**: Auth.js v5 (Credentials + GitHub OAuth)
- **UI**: shadcn/ui (base-nova), Tailwind CSS v4
- **Markdown**: react-markdown + remark-gfm + rehype-highlight + custom remark-wiki-link
- **Graph**: react-force-graph-2d
- **i18n**: next-intl 4 (zh / en)
- **Theme**: next-themes
- **Validation**: Zod 4
- **Testing**: Jest 30 + @testing-library/react, Playwright (E2E)
- **Deploy**: Vercel

## Getting Started

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, AUTH_SECRET, etc.
npx prisma db push            # sync schema to database
npm run seed                  # create admin user
npm run dev                   # http://localhost:3000
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint 9 flat config
npm run seed         # Seed admin user (prisma/seed.ts)
npm test             # Run unit & component tests
npx playwright test  # Run E2E tests
npx prisma studio    # Open Prisma database GUI
```

## Project Structure

```
app/
├── page.tsx                     # Homepage: knowledge graph
├── posts/[slug]/page.tsx        # Post detail + comments + backlinks
├── categories/[slug]/page.tsx   # Posts filtered by category
├── tags/[slug]/page.tsx         # Posts filtered by tag
├── search/page.tsx              # Search results
├── about/page.tsx               # About page
├── admin/                       # Dashboard (auth-guarded)
├── login/                       # Login page
└── api/                         # API routes (auth, posts, comments, search, graph)

components/
├── layout/                      # Header, Footer
├── blog/                        # PostCard, MarkdownRenderer, KnowledgeGraph, Backlinks, ...
├── admin/                       # PostForm, managers
└── auth/                        # SessionProviderWrapper

lib/                             # prisma, auth, queries, validations, graph, wiki-link utils
messages/                        # i18n: zh.json, en.json
prisma/                          # schema.prisma, seed.ts
__tests__/                       # Unit & component tests
e2e/                             # Playwright E2E tests
```

## Architecture Notes

- **Prisma 7**: Client generated to `app/generated/prisma/` (not `@prisma/client`). `prisma.config.ts` holds the datasource URL. `PrismaPg` adapter is required.
- **Auth**: JWT sessions. No `middleware.ts` — auth guard lives in `app/admin/layout.tsx`. Login at `/login` (not under `/admin/`).
- **i18n**: Cookie-driven via `NEXT_LOCALE`. Fallback: Accept-Language → `zh`.
- **Build**: Public pages use `force-dynamic` to avoid PgBouncer pool exhaustion.

## License

MIT
