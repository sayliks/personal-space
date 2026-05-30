import { getGraphPosts } from "@/lib/queries"
import { NextResponse } from "next/server"
import { buildGraphData } from "@/lib/graph"

export async function GET() {
  try {
    const posts = await getGraphPosts()

    const graph = buildGraphData(
      posts.map((p) => ({
        ...p,
        category: p.category ? { name: p.category.title } : null,
      }))
    )
    return NextResponse.json(graph, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    })
  } catch (error) {
    console.error("Failed to build graph data:", error)
    return NextResponse.json({ error: "Failed to build graph data" }, { status: 500 })
  }
}
