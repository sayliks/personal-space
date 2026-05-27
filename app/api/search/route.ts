import { searchPosts } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] })
  }

  try {
    const posts = await searchPosts(q.trim())
    const results = posts.map(({ id, title, slug, summary, publishedAt }) => ({
      id,
      title,
      slug,
      summary,
      publishedAt,
    }))
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search failed:", error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
