import { getRelatedPosts } from "@/lib/queries"
import Link from "next/link"

interface RelatedNotesProps {
  postId: string
  tags: Array<{ id: string; name: string }>
  categoryId?: string | null
}

export async function RelatedNotes({ postId, tags, categoryId }: RelatedNotesProps) {
  if (tags.length === 0 && !categoryId) return null

  // Find posts with shared tags or same category
  const tagIds = tags.map((t) => t.id)

  const relatedPosts = await getRelatedPosts({ postId, tagIds, categoryId, limit: 3 })

  if (relatedPosts.length === 0) return null

  return (
    <section className="border-t border-border/20 pt-12 mt-16">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-8 font-mono">
        Related Explorations
      </h2>
      <div className="space-y-6">
        {relatedPosts.map((post) => {
          // Find shared tags
          const sharedTags = post.tags
            .filter(pt => tagIds.includes(pt.tag.id))
            .map(pt => pt.tag.name)

          return (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group block"
            >
              <article className="space-y-2">
                <h3 className="text-lg font-serif group-hover:text-muted-foreground/80 transition-colors duration-200">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">
                    {post.summary}
                  </p>
                )}
                {sharedTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/50 font-mono">
                    <span>Shared:</span>
                    {sharedTags.slice(0, 2).map((tag, i) => (
                      <span key={i}>#{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
