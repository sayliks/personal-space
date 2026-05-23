# frostsalix's blog

A personal full-stack blog built with Next.js 16.

## Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Database**: PostgreSQL on Supabase, Prisma 7
- **Auth**: Auth.js v5 (Credentials + GitHub OAuth)
- **UI**: shadcn/ui, Tailwind CSS v4
- **Content**: react-markdown + rehype-highlight
- **i18n**: next-intl (zh/en)
- **Deploy**: Vercel

## Getting Started

```bash
npm install
cp .env.example .env      # then fill in required values
npx prisma db push
npm run seed               # create admin user
npm run dev                # http://localhost:3000
```

## Project Structure

```
app/              # Next.js App Router pages & API routes
components/       # UI components (layout, blog, admin)
lib/              # Shared utilities (prisma, auth, queries, validations)
messages/         # i18n translation files (zh.json, en.json)
prisma/           # Schema, migrations, seed
```

See [docs/PLAN.md](docs/PLAN.md) for the full development roadmap.
