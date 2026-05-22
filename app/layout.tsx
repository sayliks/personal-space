import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { SessionProviderWrapper } from "@/components/auth/SessionProviderWrapper"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const notoSansSC = Noto_Sans_SC({
  variable: "--font-heading",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "frostsalix's blog",
    template: "%s | frostsalix's blog",
  },
  description: "A personal blog built with Next.js",
  openGraph: {
    type: "website",
    siteName: "frostsalix's blog",
    title: "frostsalix's blog",
    description: "A personal blog built with Next.js",
  },
  twitter: {
    card: "summary",
    title: "frostsalix's blog",
    description: "A personal blog built with Next.js",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SessionProviderWrapper>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </SessionProviderWrapper>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
