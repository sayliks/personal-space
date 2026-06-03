import { getTranslations } from "next-intl/server"
import { Pagination } from "@/components/blog/Pagination"
import { isPostRevisited } from "@/lib/posts/revision-status"
import { getPublishedPosts } from "@/lib/queries"
import { formatDateShort, formatDateDots } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("posts")
  return {
    title: t("title"),
  }
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const t = await getTranslations("posts")
  const tCommon = await getTranslations("common")
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const { posts, totalPages } = await getPublishedPosts({ page, pageSize: 100 })

  return (
    <div className="mx-auto max-w-[908px] px-5 sm:px-6">
      <header className="pt-14 pb-8 sm:pt-20">
        <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
          {t("title")}
        </h1>
      </header>

      <div className="border-t border-border/40 pt-6 pb-10">
        {posts.length === 0 ? (
          <p className="text-sm italic text-muted-foreground/50">{t("noPosts")}</p>
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
                    {formatDateDots(post.publishedAt)}
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

      {totalPages > 1 && (
        <div className="pb-10">
          <Pagination page={page} totalPages={totalPages} baseUrl="/posts" />
        </div>
      )}
    </div>
  )
}
