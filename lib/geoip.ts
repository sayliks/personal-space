import { env } from "@/lib/env"

type GeoDetails = {
  city: string | null
  country: string | null
}

export type PageViewLocation = GeoDetails & {
  ip: string | null
}

type CachedGeoDetails = GeoDetails & {
  expiresAt: number
}

const GEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const GEO_LOOKUP_TIMEOUT_MS = 1000
const geoCache = new Map<string, CachedGeoDetails>()

const CLIENT_IP_HEADERS = [
  "x-analytics-client-ip",
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
  "x-forwarded-for",
  "x-client-ip",
  "fastly-client-ip",
] as const

export async function resolvePageViewLocation(
  headers: Headers,
  bodyIp: unknown
): Promise<PageViewLocation> {
  const ip = getClientIp(headers, bodyIp)
  const headerGeo = getGeoDetailsFromHeaders(headers)

  if (!ip || isNonPublicIp(ip)) {
    return {
      ip,
      ...headerGeo,
    }
  }

  if (headerGeo.city && headerGeo.country) {
    cacheGeoDetails(ip, headerGeo)
    return {
      ip,
      ...headerGeo,
    }
  }

  const lookedUpGeo = await lookupPublicIp(ip)

  return {
    ip,
    city: headerGeo.city ?? lookedUpGeo.city,
    country: headerGeo.country ?? lookedUpGeo.country,
  }
}

function getClientIp(headers: Headers, bodyIp: unknown) {
  const headerIp = CLIENT_IP_HEADERS.map((name) => headers.get(name))
    .find((value): value is string => Boolean(value))

  return normalizeIp(headerIp ?? bodyIp)
}

function normalizeIp(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  let ip = value.split(",")[0]?.trim()

  if (!ip || ip.toLowerCase() === "unknown") {
    return null
  }

  if (ip.startsWith("[") && ip.includes("]")) {
    ip = ip.slice(1, ip.indexOf("]"))
  }

  if (ip.toLowerCase().startsWith("::ffff:")) {
    ip = ip.slice(7)
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.replace(/:\d+$/, "")
  }

  return ip
}

function getGeoDetailsFromHeaders(headers: Headers): GeoDetails {
  return {
    city: cleanHeaderValue(
      headers.get("x-analytics-city") ??
        headers.get("x-vercel-ip-city") ??
        headers.get("cf-ipcity") ??
        headers.get("x-geo-city")
    ),
    country: cleanHeaderValue(
      headers.get("x-analytics-country") ??
        headers.get("x-vercel-ip-country") ??
        headers.get("cf-ipcountry") ??
        headers.get("x-geo-country")
    ),
  }
}

function cleanHeaderValue(value: string | null) {
  if (!value) {
    return null
  }

  try {
    return cleanString(decodeURIComponent(value))
  } catch {
    return cleanString(value)
  }
}

async function lookupPublicIp(ip: string): Promise<GeoDetails> {
  if (env.ANALYTICS_GEOLOOKUP === "false") {
    return emptyGeoDetails()
  }

  const cached = geoCache.get(ip)
  if (cached && cached.expiresAt > Date.now()) {
    return {
      city: cached.city,
      country: cached.country,
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), GEO_LOOKUP_TIMEOUT_MS)

    try {
      const response = await fetch(
        `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
        {
          cache: "no-store",
          headers: {
            accept: "application/json",
          },
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        return emptyGeoDetails()
      }

      const data = (await response.json()) as {
        city?: unknown
        country?: unknown
        country_name?: unknown
        error?: unknown
      }

      if (data.error) {
        return emptyGeoDetails()
      }

      const details = {
        city: cleanString(data.city),
        country: cleanString(data.country_name) ?? cleanString(data.country),
      }

      cacheGeoDetails(ip, details)

      return details
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    return emptyGeoDetails()
  }
}

function cacheGeoDetails(ip: string, details: GeoDetails) {
  geoCache.set(ip, {
    ...details,
    expiresAt: Date.now() + GEO_CACHE_TTL_MS,
  })
}

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  return normalized.slice(0, 120)
}

function emptyGeoDetails(): GeoDetails {
  return {
    city: null,
    country: null,
  }
}

function isNonPublicIp(ip: string) {
  const lowerIp = ip.toLowerCase()

  if (
    lowerIp === "localhost" ||
    lowerIp === "::" ||
    lowerIp === "::1" ||
    lowerIp.startsWith("fc") ||
    lowerIp.startsWith("fd") ||
    lowerIp.startsWith("fe80:")
  ) {
    return true
  }

  const parts = ip.split(".").map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false
  }

  const [first, second] = parts

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 0 && (parts[2] === 0 || parts[2] === 2)) ||
    (first === 198 && second >= 18 && second <= 19) ||
    (first === 198 && second === 51 && parts[2] === 100) ||
    (first === 203 && second === 0 && parts[2] === 113)
  )
}
