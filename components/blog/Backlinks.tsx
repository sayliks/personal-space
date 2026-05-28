import { getPostById, getBacklinkCandidates } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
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

  const t = await getTranslations("graph").catch(() => null)
  if (!t) return null

  return (
    <section className="border-t pt-8 mt-8">
      <h2 className="text-lg font-semibold mb-4">{t("backlinks")}</h2>
      <ul className="space-y-3">
        {backlinks.map((bl) => (
          <li key={bl.id}>
            <Link
              href={`/posts/${bl.slug}`}
              className="group block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <span className="font-medium group-hover:underline">{bl.title}</span>
              {bl.summary && (
                <p className="text-sm text-muted-foreground mt-1">{bl.summary}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
