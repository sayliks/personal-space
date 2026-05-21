import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] })
  }

  const results = await prisma.post.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  })

  return NextResponse.json({ results })
}
