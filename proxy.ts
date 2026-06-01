import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip tracking for:
  // - API routes
  // - Static files
  // - Admin pages
  // - Auth pages
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // Track page view asynchronously (fire and forget)
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    null
  const userAgent = request.headers.get("user-agent")
  const referer = request.headers.get("referer")

  // Send tracking data to API route (non-blocking)
  const trackingUrl = new URL("/api/analytics/track", request.url)
  const trackingHeaders = new Headers({
    "Content-Type": "application/json",
  })

  copyHeader(trackingHeaders, "x-analytics-client-ip", ip)
  copyHeader(
    trackingHeaders,
    "x-analytics-city",
    request.headers.get("x-vercel-ip-city") ||
      request.headers.get("cf-ipcity") ||
      request.headers.get("x-geo-city")
  )
  copyHeader(
    trackingHeaders,
    "x-analytics-country",
    request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-geo-country")
  )

  fetch(trackingUrl, {
    method: "POST",
    headers: trackingHeaders,
    body: JSON.stringify({
      path: pathname,
      ip,
      userAgent,
      referer,
    }),
  }).catch(() => {
    // Silently fail - don't block page load
  })

  return NextResponse.next()
}

function copyHeader(
  target: Headers,
  name: string,
  value: string | null
) {
  if (value) {
    target.set(name, value)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
