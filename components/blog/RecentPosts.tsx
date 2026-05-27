import Link from "next/link"
import { getPublishedPosts } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
import { formatDate } from "@/lib/utils"

export async function RecentPosts() {
  const t = await getTranslations("home")
  const { posts } = await getPublishedPosts({ page: 1, pageSize: 5 })

  if (posts.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
        {t("recentPosts")}
      </h2>
      <ul className="space-y-1">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/posts/${post.slug}`}
              className="inline-flex items-baseline gap-2 group"
            >
              <span className="text-muted-foreground text-sm tabular-nums shrink-0">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span className="group-hover:underline truncate">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
