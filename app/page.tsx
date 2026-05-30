import { getAllCategories, getAllTags, getHomePosts } from "@/lib/queries"
import { isPostRevisited } from "@/lib/posts/revision-status"
import { formatDateShort } from "@/lib/utils"
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

function noteDate(d: Date | null) {
  if (!d) return "····"
  return d
    .toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/-/g, ".")
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
  const tCommon = await getTranslations("common")

  const posts = await safeHomeQuery("posts", () => getHomePosts(14), [])
  const categories = await safeHomeQuery("categories", () => getAllCategories(), [])
  const tags = await safeHomeQuery("tags", () => getAllTags(), [])

  const sortedTags = [...tags]
    .sort((a, b) => b._count.documents - a._count.documents)
    .filter((tg) => tg._count.documents > 0)

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-6">
      {/* Intro — a few quiet lines, no hero */}
      <section className="pt-14 pb-12 sm:pt-20">
        <h1 className="text-base font-medium text-foreground">{t("heroName")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-prose">
          {t("heroIntro")}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/70 max-w-prose">
          <span className="text-muted-foreground/50">{t("currentlyLabel")}: </span>
          {t("currentlyExploring")}
        </p>
      </section>

      {/* Notes — dense, hanging-date list */}
      <section className="border-t border-border/40 py-10">
        <h2 className="mb-6 font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
          {t("notesLabel")}
        </h2>

        {posts.length === 0 ? (
          <p className="text-sm italic text-muted-foreground/50">{t("noPostsYet")}</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.id} className="group">
                <Link
                  href={`/posts/${post.slug}`}
                  className="flex gap-4 py-1.5 -mx-2 px-2 rounded hover:bg-muted/40 transition-colors"
                >
                  <time
                    dateTime={post.publishedAt?.toISOString()}
                    className="shrink-0 pt-0.5 font-mono text-xs tabular-nums text-muted-foreground/40"
                  >
                    {noteDate(post.publishedAt)}
                  </time>
                  <span className="flex-1 text-sm leading-snug text-foreground/85 group-hover:text-foreground decoration-border underline-offset-4 group-hover:underline">
                    {post.title}
                  </span>
                  {isPostRevisited(post) && (
                    <span className="shrink-0 self-start pt-0.5 font-mono text-[11px] text-muted-foreground/30">
                      {tCommon("tended")} {formatDateShort(post.updatedAt)}
                    </span>
                  )}
                  {post.category && (
                    <span className="shrink-0 self-start pt-0.5 font-mono text-[11px] text-muted-foreground/35">
                      {post.category.title}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {posts.length > 0 && (
          <Link
            href="/posts"
            className="mt-6 inline-block font-mono text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            {t("allNotes")} →
          </Link>
        )}
      </section>

      {/* Topics — categories as plain inline references */}
      {categories.length > 0 && (
        <section className="border-t border-border/40 py-10">
          <h2 className="mb-6 font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
            {t("topicsLabel")}
          </h2>
          <ul className="space-y-1.5">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="group flex items-baseline gap-3 text-sm"
                >
                  <span className="text-foreground/80 group-hover:text-foreground decoration-border underline-offset-4 group-hover:underline">
                    {category.title}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/35">
                    {category._count.documents}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tags — wrapped index of threads */}
      {sortedTags.length > 0 && (
        <section className="border-t border-border/40 py-10">
          <h2 className="mb-6 font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
            {t("threadsLabel")}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {sortedTags.map((tg) => (
              <Link
                key={tg.id}
                href={`/tags/${tg.slug}`}
                className="font-mono text-xs text-muted-foreground/55 hover:text-foreground transition-colors"
              >
                #{tg.name}
                <span className="text-muted-foreground/25"> {tg._count.documents}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quiet meta line */}
      <footer className="border-t border-border/40 py-10">
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground/35">
          {t("footerMeta")}
        </p>
      </footer>
    </div>
  )
}
