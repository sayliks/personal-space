import { extractWikiLinks } from "@/lib/wiki-link"

export interface GraphNode {
  id: string
  title: string
  slug: string
  group: string
  val: number
}

export interface GraphLink {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface PostForGraph {
  id: string
  title: string
  slug: string
  content: string | null
  category: { name: string } | null
}

export function buildGraphData(posts: PostForGraph[]): GraphData {
  const titleMap = new Map<string, { id: string; slug: string; group: string }>()

  for (const post of posts) {
    const group = post.category?.name ?? "uncategorized"
    titleMap.set(post.title.toLowerCase(), { id: post.id, slug: post.slug, group })
    titleMap.set(post.slug, { id: post.id, slug: post.slug, group })
  }

  const links: GraphLink[] = []
  const seen = new Set<string>()

  for (const post of posts) {
    if (!post.content) continue
    const targets = extractWikiLinks(post.content)
    for (const target of targets) {
      const resolved = titleMap.get(target.toLowerCase())
      if (resolved && resolved.id !== post.id) {
        const key = `${post.id}->${resolved.id}`
        if (!seen.has(key)) {
          seen.add(key)
          links.push({ source: post.id, target: resolved.id })
        }
      }
    }
  }

  const degree = new Map<string, number>()
  for (const link of links) {
    degree.set(link.source, (degree.get(link.source) ?? 0) + 1)
    degree.set(link.target, (degree.get(link.target) ?? 0) + 1)
  }

  const nodes: GraphNode[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    group: post.category?.name ?? "uncategorized",
    val: degree.get(post.id) ?? 0,
  }))

  return { nodes, links }
}
