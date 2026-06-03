import { NextRequest, NextResponse } from "next/server"
import { getPublishedPosts } from "@/lib/queries"
import { parsePositiveInt } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1)
  const pageSize = Math.min(
    24,
    parsePositiveInt(request.nextUrl.searchParams.get("pageSize"), 6)
  )

  const result = await getPublishedPosts({ page, pageSize })

  return NextResponse.json({
    ...result,
    posts: result.posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      coverImage: post.coverImage,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      updatedAt: post.updatedAt.toISOString(),
      category: post.category
        ? {
            title: post.category.title,
          }
        : null,
    })),
  })
}
