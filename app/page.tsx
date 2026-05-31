import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { SayliksSplash } from "./SayliksSplash"
import { isPostRevisited } from "@/lib/posts/revision-status"
import { getHomeQuotes, getPublishedPosts, getPublishedPhotos } from "@/lib/queries"
import { formatDateShort } from "@/lib/utils"
import { PhotoWall } from "@/components/blog/PhotoWall"
import { DailyQuote } from "@/components/blog/DailyQuote"

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

export default async function HomePage() {
  const tPosts = await getTranslations("posts")
  const tCommon = await getTranslations("common")
  const cookieStore = await cookies()
  const shouldPlayIntro = cookieStore.get("sayliks_intro_seen")?.value !== "1"
  const [{ posts }, photos, quotes] = await Promise.all([
    getPublishedPosts({ page: 1, pageSize: 20 }),
    getPublishedPhotos(),
    getHomeQuotes(6),
  ])
  const displayPhotos = photos.slice(0, 16)

  return (
    <>
      <SayliksSplash shouldPlay={shouldPlayIntro} />
      <div className="mx-auto max-w-[908px] px-5 sm:px-6">
        {/* Daily Quote Section */}
        <div className="pt-14 pb-8 sm:pt-20">
          <DailyQuote />
        </div>

        {/* Quotes Section */}
        <section className="pb-10">
          <header className="pb-8">
            <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground font-medium">
              {tPosts("quotes")}
            </h1>
          </header>

          <div className="border-t border-border/40 pt-6">
            {quotes.length === 0 ? (
              <p className="text-sm italic text-muted-foreground/50">{tPosts("noQuotes")}</p>
            ) : (
              <ul className="space-y-3">
                {quotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-4"
                  >
                    <time
                      dateTime={quote.publishedAt?.toISOString()}
                      className="pt-1 font-mono text-xs tabular-nums text-muted-foreground/60 sm:text-sm"
                    >
                      {noteDate(quote.publishedAt ?? quote.createdAt)}
                    </time>
                    <p className="whitespace-pre-wrap text-base leading-7 text-foreground/85">
                      {quote.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Writing Section */}
        <header className="pb-8 flex items-center justify-between gap-4">
          <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground font-medium">
            {tPosts("title")}
          </h1>
          <Link
            href="/posts"
            className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
          >
            {tPosts("viewAll")}
          </Link>
        </header>

        <div className="border-t border-border/40 pt-6 pb-10">
          {posts.length === 0 ? (
            <p className="text-sm italic text-muted-foreground/50">{tPosts("noPosts")}</p>
          ) : (
            <ul>
              {posts.map((post) => (
                <li key={post.id} className="group">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="-mx-2 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 rounded px-2 py-2.5 transition-colors hover:bg-muted/40 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto_auto] sm:gap-x-4"
                  >
                    <time
                      dateTime={post.publishedAt?.toISOString()}
                      className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground/60 sm:text-sm"
                    >
                      {noteDate(post.publishedAt)}
                    </time>
                    <span className="text-base leading-snug text-foreground font-medium decoration-border underline-offset-4 group-hover:underline">
                      {post.title}
                    </span>
                    {isPostRevisited(post) && (
                      <span className="col-start-2 self-start pt-0.5 font-mono text-xs text-muted-foreground/50 sm:col-start-auto">
                        {tCommon("tended")} {formatDateShort(post.updatedAt)}
                      </span>
                    )}
                    {post.category && (
                      <span className="col-start-2 self-start pt-0.5 font-mono text-xs text-muted-foreground/55 sm:col-start-auto">
                        {post.category.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Photo Wall Section */}
        {photos.length > 0 && (
          <>
            <header className="pt-8 pb-6 flex items-center justify-between gap-4">
              <h2 className="font-mono text-xs lowercase tracking-wide text-muted-foreground font-medium">
                {tPosts("gallery")}
              </h2>
              <Link
                href="/gallery"
                className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
              >
                {tPosts("viewAll")}
              </Link>
            </header>

            <div className="border-t border-border/40 pt-6 pb-10">
              <PhotoWall photos={displayPhotos} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
