import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { CategoryBadge } from "@/components/blog/CategoryBadge"
import { TagList } from "@/components/blog/TagBadge"
import type { PostWithRelations } from "@/lib/queries"

export function PostCard({ post }: { post: PostWithRelations }) {
  const tags = post.tags.map((pt) => pt.tag)

  return (
    <article className="border-b pb-6 last:border-0">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          {post.category && (
            <CategoryBadge name={post.category.name} slug={post.category.slug} />
          )}
        </div>
        <Link href={`/posts/${post.slug}`} className="group">
          <h2 className="text-xl font-bold group-hover:underline">{post.title}</h2>
        </Link>
        {post.summary && (
          <p className="text-muted-foreground text-sm leading-relaxed">{post.summary}</p>
        )}
        {tags.length > 0 && <TagList tags={tags} />}
      </div>
    </article>
  )
}
