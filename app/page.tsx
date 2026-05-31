import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { SayliksSplash } from "./SayliksSplash"
import { isPostRevisited } from "@/lib/posts/revision-status"
import { getPublishedPosts, getPublishedPhotos } from "@/lib/queries"
import { formatDateShort } from "@/lib/utils"
import { PhotoWall } from "@/components/blog/PhotoWall"

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
  const { posts } = await getPublishedPosts({ page: 1, pageSize: 40 })
  const photos = await getPublishedPhotos()

  return (
    <>
      <SayliksSplash shouldPlay={shouldPlayIntro} />
      <div className="mx-auto max-w-[908px] px-5 sm:px-6">
        <header className="pt-14 pb-8 sm:pt-20">
          <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
            {tPosts("title")}
          </h1>
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
                    className="-mx-2 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 rounded px-2 py-1.5 transition-colors hover:bg-muted/40 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto_auto]"
                  >
                    <time
                      dateTime={post.publishedAt?.toISOString()}
                      className="pt-0.5 font-mono text-xs tabular-nums text-muted-foreground/40"
                    >
                      {noteDate(post.publishedAt)}
                    </time>
                    <span className="text-sm leading-snug text-foreground/85 decoration-border underline-offset-4 group-hover:text-foreground group-hover:underline">
                      {post.title}
                    </span>
                    {isPostRevisited(post) && (
                      <span className="col-start-2 self-start pt-0.5 font-mono text-[11px] text-muted-foreground/30 sm:col-start-auto">
                        {tCommon("tended")} {formatDateShort(post.updatedAt)}
                      </span>
                    )}
                    {post.category && (
                      <span className="col-start-2 self-start pt-0.5 font-mono text-[11px] text-muted-foreground/35 sm:col-start-auto">
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
            <header className="pt-8 pb-6">
              <h2 className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
                gallery
              </h2>
            </header>

            <div className="border-t border-border/40 pt-6 pb-10">
              <PhotoWall photos={photos} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
