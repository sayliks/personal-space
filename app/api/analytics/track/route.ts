import { NextRequest, NextResponse } from "next/server"
import { resolvePageViewLocation } from "@/lib/geoip"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { ip, city, country } = await resolvePageViewLocation(
      request.headers,
      body.ip
    )

    await prisma.pageView.create({
      data: {
        path: cleanString(body.path) ?? "/",
        ip,
        userAgent: cleanString(body.userAgent) ?? request.headers.get("user-agent"),
        referer: cleanString(body.referer) ?? request.headers.get("referer"),
        country,
        city,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    // Return success even on error to not block page loads
    return NextResponse.json({ success: true })
  }
}

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()

  return normalized || null
}
