import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { escapeRegex } from "@/lib/utils"

interface BacklinksProps {
  postId: string
}

export async function Backlinks({ postId }: BacklinksProps) {
  try {
    const targetPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { title: true, slug: true },
    })
    if (!targetPost) return null

    const candidates = await prisma.post.findMany({
      where: {
        published: true,
        id: { not: postId },
        OR: [
          { content: { contains: targetPost.title, mode: "insensitive" } },
          { content: { contains: `[[${targetPost.slug}]]`, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true, summary: true, content: true },
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

    const t = await getTranslations("graph")

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
  } catch {
    return null
  }
}
