import { NextRequest, NextResponse } from "next/server"
import { getPublishedQuotes } from "@/lib/queries"
import { parsePositiveInt } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1)
  const pageSize = Math.min(
    24,
    parsePositiveInt(request.nextUrl.searchParams.get("pageSize"), 6)
  )

  const result = await getPublishedQuotes({ page, pageSize })

  return NextResponse.json({
    ...result,
    quotes: result.quotes.map((quote) => ({
      id: quote.id,
      title: quote.title,
      content: quote.content,
      publishedAt: quote.publishedAt?.toISOString() ?? null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
    })),
  })
}
