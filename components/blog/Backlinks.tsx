import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getCachedGraphData, getBacklinksFromGraph } from "@/lib/graph"

interface BacklinksProps {
  postId: string
}

export async function Backlinks({ postId }: BacklinksProps) {
  const posts = await prisma.post.findMany({
    where: { published: true, publishedAt: { lte: new Date() } },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      category: { select: { name: true } },
    },
  })

  const { data: graph } = getCachedGraphData(posts)
  const backlinks = getBacklinksFromGraph(postId, graph, posts)

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
}
