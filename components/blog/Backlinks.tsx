import { getPostById, getBacklinkCandidates } from "@/lib/queries"
import Link from "next/link"
import { escapeRegex } from "@/lib/utils"

interface BacklinksProps {
  postId: string
}

export async function Backlinks({ postId }: BacklinksProps) {
  const targetPost = await getPostById(postId).catch((e) => {
    console.error("Backlinks: failed to find post:", e)
    return null
  })
  if (!targetPost) return null

  const candidates = await getBacklinkCandidates({
    postId,
    title: targetPost.title,
    slug: targetPost.slug,
  }).catch((e) => {
    console.error("Backlinks: failed to fetch candidates:", e)
    return []
  })

  const wikiLinkPattern = new RegExp(
    `\\[\\[${escapeRegex(targetPost.title)}(\\|[^\\]]+)?\\]\\]`,
    "i"
  )
  const slugPattern = new RegExp(
    `\\[\\[${escapeRegex(targetPost.slug)}(\\|[^\\]]+)?\\]\\]`,
    "i"
  )

  const backlinks = candidates.filter(
    (c) =>
      c.content &&
      (wikiLinkPattern.test(c.content) || slugPattern.test(c.content))
  )

  if (backlinks.length === 0) return null

  return (
    <section className="border-t border-border/20 pt-12 mt-16">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-8 font-mono">
        标签的笔记
      </h2>
      <div className="space-y-6">
        {backlinks.map((bl) => (
          <Link
            key={bl.id}
            href={`/posts/${bl.slug}`}
            className="group block"
          >
            <article className="space-y-2">
              <h3 className="text-lg font-serif group-hover:text-muted-foreground/80 transition-colors duration-200">
                {bl.title}
              </h3>
              {bl.summary && (
                <p className="text-sm text-muted-foreground/70 leading-relaxed">
                  {bl.summary}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/50 font-mono">
                <span>→</span>
                <span>引用了这篇笔记</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
