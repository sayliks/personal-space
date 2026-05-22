import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { routing } from "./routing"

const LOCALE_COOKIE = "NEXT_LOCALE"

export default getRequestConfig(async () => {
  let locale = (await cookies()).get(LOCALE_COOKIE)?.value

  if (!locale) {
    const acceptLanguage = (await headers()).get("accept-language")
    locale = acceptLanguage?.split(",")[0]?.split("-")[0]
  }

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
