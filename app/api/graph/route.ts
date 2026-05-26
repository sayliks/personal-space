import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { buildGraphData } from "@/lib/graph"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, publishedAt: { lte: new Date() } },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        category: { select: { name: true } },
      },
    })

    const graph = buildGraphData(posts)
    return NextResponse.json(graph, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    })
  } catch {
    return NextResponse.json({ error: "Failed to build graph data" }, { status: 500 })
  }
}
