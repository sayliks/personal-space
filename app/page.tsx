import { getAllCategories, getAllTags, getHomePosts } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  return {
    title: t("siteTitle"),
    description: t("tagline"),
  }
}

function isTransientPrismaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message.includes("Connection terminated unexpectedly") ||
    error.message.includes("Operation has timed out") ||
    error.message.includes("P1001")
  )
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatUpdateDate(date: Date | null) {
  if (!date) return null
  return date
    .toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".")
}

async function safeHomeQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query()
  } catch (error) {
    if (isTransientPrismaError(error)) {
      await delay(100)
      try {
        return await query()
      } catch (retryError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`HomePage: ${label} query retry failed:`, retryError)
        }
        return fallback
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`HomePage: ${label} query failed:`, error)
    }
    return fallback
  }
}

export default async function HomePage() {
  const t = await getTranslations("home")

  const posts = await safeHomeQuery("posts", () => getHomePosts(6), [])
  const categories = await safeHomeQuery("categories", () => getAllCategories(), [])
  const tags = await safeHomeQuery("tags", () => getAllTags(), [])

  const sortedTags = [...tags]
    .sort((a, b) => b._count.documents - a._count.documents)
    .filter((tag) => tag._count.documents > 0)

  const modules = [
    {
      label: t("moduleNotes"),
      description: t("moduleNotesDesc"),
      href: "/posts",
      count: posts.length ? t("moduleCount", { count: posts.length }) : t("moduleOpen"),
      active: true,
    },
    {
      label: t("moduleTools"),
      description: t("moduleToolsDesc"),
      href: "/search",
      count: t("moduleSearch"),
      active: false,
    },
    {
      label: t("moduleGuides"),
      description: t("moduleGuidesDesc"),
      // TODO: Replace with a dedicated /guides route when the knowledge-base guide surface exists.
      href: categories[0] ? `/categories/${categories[0].slug}` : "/posts",
      count: categories.length ? t("moduleCount", { count: categories.length }) : t("moduleOpen"),
      active: false,
    },
    {
      label: t("moduleProjects"),
      description: t("moduleProjectsDesc"),
      // TODO: Replace with a dedicated /projects route when project documents are modeled separately.
      href: sortedTags[0] ? `/tags/${sortedTags[0].slug}` : "/about",
      count: sortedTags.length ? t("moduleCount", { count: sortedTags.length }) : t("moduleOpen"),
      active: false,
    },
  ]

  const focusTopics = [
    t("focusKnowledge"),
    t("focusAI"),
    t("focusWriting"),
    t("focusSystems"),
  ]

  const starterLinks = [
    {
      label: t("starterBegin"),
      href: posts[0] ? `/posts/${posts[0].slug}` : "/posts",
      meta: t("starterBeginMeta"),
    },
    {
      label: t("starterRevisit"),
      // TODO: Replace with a dedicated revisit/saved-notes route when available.
      href: posts[1] ? `/posts/${posts[1].slug}` : "/posts",
      meta: t("starterRevisitMeta"),
    },
  ]

  return (
    <main className="knowledge-home mx-auto w-full max-w-[1180px] px-5 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-18">
      <section className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/38">
            {t("indexLabel")}
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-[clamp(36px,7.4vw,88px)] font-medium leading-[0.98] tracking-[-0.025em] text-foreground/92">
            {t("knowledgeTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
            {t("knowledgeIntro")}
          </p>

          <nav aria-label={t("moduleNavigation")} className="mt-12 border-b border-foreground/10 sm:mt-16 dark:border-white/10">
            {modules.map((module, index) => (
              <Link
                key={module.label}
                href={module.href}
                data-active={module.active ? "true" : undefined}
                className="kb-index-row group grid gap-3 border-t border-foreground/10 py-5 transition-colors hover:border-foreground/28 dark:border-white/10 dark:hover:border-white/24 sm:grid-cols-[4rem_minmax(0,1fr)_12rem_2rem] sm:items-baseline"
              >
                <span className="hidden font-mono text-[11px] text-muted-foreground/38 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="knowledge-module-label text-[clamp(36px,10vw,68px)] font-medium leading-[0.94] tracking-[-0.025em] transition-colors">
                  {module.label}
                </span>
                <span className="max-w-[15rem] text-xs leading-5 text-muted-foreground/64 transition-colors group-hover:text-muted-foreground">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/42">
                    {module.count}
                  </span>
                  {module.description}
                </span>
                <span className="self-start justify-self-start font-mono text-2xl leading-none text-muted-foreground/28 transition-transform group-hover:translate-x-1 group-hover:text-foreground/66 sm:self-center">
                  →
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <aside className="lg:pt-40">
          <div className="flex items-center justify-between border-t border-foreground/10 pt-5 dark:border-white/10">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/42">
              {t("recentActivity")}
            </h2>
            <Link
              href="/search"
              className="font-mono text-[11px] text-muted-foreground/48 transition-colors hover:text-foreground"
            >
              {t("exploreGarden")}
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="mt-6 text-sm italic text-muted-foreground/50">{t("noPostsYet")}</p>
          ) : (
            <ul className="mt-5 divide-y divide-foreground/8 dark:divide-white/8">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="grid gap-2 py-4 text-sm leading-6 text-foreground/48 transition-colors hover:text-foreground/84"
                  >
                    <span>{post.title}</span>
                    <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/36">
                      {formatUpdateDate(post.publishedAt) && (
                        <time dateTime={post.publishedAt?.toISOString()}>
                          {formatUpdateDate(post.publishedAt)}
                        </time>
                      )}
                      {post.category && <span>{post.category.title}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>

      <section className="mt-16 grid gap-px border border-foreground/10 bg-foreground/10 dark:border-white/10 dark:bg-white/10 md:grid-cols-2 lg:mt-24">
        <section className="bg-background p-6 sm:p-7">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/42">
            {t("currentFocus")}
          </h2>
          <ul className="mt-8 space-y-4">
            {focusTopics.map((topic, index) => (
              <li key={topic}>
                <Link
                  href={index === 0 && categories[0] ? `/categories/${categories[0].slug}` : "/search"}
                  className="group flex items-center justify-between gap-4 text-sm text-foreground/68 transition-colors hover:text-foreground"
                >
                  <span>{topic}</span>
                  <span className="font-mono text-muted-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-foreground/60">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-background p-6 sm:p-7">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/42">
            {t("starterTitle")}
          </h2>
          <ul className="mt-7 divide-y divide-foreground/8 dark:divide-white/8">
            {starterLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group grid gap-1 py-4 text-sm text-foreground/70 transition-colors hover:text-foreground"
                >
                  <span className="flex items-center justify-between gap-4">
                    {link.label}
                    <span className="font-mono text-muted-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-foreground/60">
                      →
                    </span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/38">
                    {link.meta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  )
}
