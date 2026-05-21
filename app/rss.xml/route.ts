import { prisma } from "@/lib/prisma"
import { Feed } from "feed"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000"

export async function GET() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
    },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  })

  const feed = new Feed({
    title: "My Blog",
    description: "A personal blog",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: posts[0]?.publishedAt ?? new Date(),
    feedLinks: {
      rss: `${SITE_URL}/rss.xml`,
    },
    author: {
      name: "Blog Author",
    },
  })

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/posts/${post.slug}`,
      link: `${SITE_URL}/posts/${post.slug}`,
      description: post.summary ?? undefined,
      content: post.content ?? undefined,
      author: [{ name: post.author.name }],
      date: post.publishedAt ?? post.createdAt,
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}
