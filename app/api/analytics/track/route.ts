import { NextRequest, NextResponse } from "next/server"
import { resolvePageViewLocation } from "@/lib/geoip"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ success: true })
  }

  try {
    const body = await request.json().catch(() => ({}))
    void trackPageView(request.headers, body)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}

async function trackPageView(headers: Headers, body: Record<string, unknown>) {
  try {
    const { ip, city, country } = await resolvePageViewLocation(headers, body.ip)

    await prisma.pageView.create({
      data: {
        path: cleanString(body.path) ?? "/",
        ip,
        userAgent: cleanString(body.userAgent) ?? headers.get("user-agent"),
        referer: cleanString(body.referer) ?? headers.get("referer"),
        country,
        city,
      },
    })
  } catch {
    // Analytics must never block or surface errors.
  }
}

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()

  return normalized || null
}
