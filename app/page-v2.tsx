import { getPublishedPosts, getAllCategories } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  return {
    title: t("siteTitle"),
    description: t("tagline"),
  }
}

export default async function HomePage() {
  const t = await getTranslations("home")

  // Get only 3 featured posts
  const { posts } = await getPublishedPosts({ page: 1, pageSize: 3 })

  // Get categories
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen relative">
      {/* Responsive grid background - simplified on mobile */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] md:bg-[size:48px_48px] md:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Mobile-first responsive */}
        <header className="pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
          <div className="max-w-2xl">
            {/* Avatar - touch-friendly size */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-muted to-muted/50 border border-border/40 flex items-center justify-center text-lg sm:text-xl font-serif mb-6 sm:mb-8 backdrop-blur-sm">
              S
            </div>

            {/* Name - fluid typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-4 sm:mb-6 tracking-tight leading-tight">
              {t("heroName")}
            </h1>

            {/* Intro - responsive text size */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              {t("heroIntro")}
            </p>

            {/* Currently exploring - hidden on very small screens */}
            <p className="text-sm text-muted-foreground/80 leading-relaxed border-l-2 border-border/40 pl-3 sm:pl-4 hidden xs:block">
              {t("currentlyExploring")}
            </p>

            {/* Navigation - touch-friendly spacing */}
            <nav className="flex flex-wrap gap-4 sm:gap-6 text-sm mt-8 sm:mt-12">
              <Link
                href="/posts"
                className="text-muted-foreground hover:text-foreground active:text-foreground transition-colors duration-200 py-1"
              >
                {t("navWriting")}
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground active:text-foreground transition-colors duration-200 py-1"
              >
                {t("navAbout")}
              </Link>
              <Link
                href="/search"
                className="text-muted-foreground hover:text-foreground active:text-foreground transition-colors duration-200 py-1"
              >
                {t("navSearch")}
              </Link>
            </nav>
          </div>
        </header>

        {/* Knowledge Areas - Responsive grid */}
        {categories.length > 0 && (
          <section className="pb-16 sm:pb-20 md:pb-32 lg:pb-40">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-8 sm:mb-10 md:mb-12 font-mono">
              {t("knowledgeAreas")}
            </h2>

            <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block p-5 sm:p-6 border border-border/40 hover:border-border/80 active:border-border bg-card/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 rounded-lg touch-manipulation"
                >
                  <div className="flex items-baseline justify-between mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-medium group-hover:text-foreground transition-colors">
                      {category.title}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {category._count.documents}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    {t(`categoryDesc.${category.slug}`, { defaultValue: t("categoryDescDefault") })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Writing - Responsive spacing */}
        <section className="pb-16 sm:pb-20 md:pb-32 lg:pb-40">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-8 sm:mb-10 md:mb-12 font-mono">
            {t("featuredWriting")}
          </h2>

          {posts.length === 0 ? (
            <p className="text-muted-foreground/60 italic text-sm sm:text-base">
              {t("noPostsYet")}
            </p>
          ) : (
            <div className="space-y-10 sm:space-y-12 md:space-y-16">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="group"
                >
                  <Link href={`/posts/${post.slug}`} className="block touch-manipulation">
                    {/* Metadata - responsive font */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs text-muted-foreground/60 font-mono">
                      <time dateTime={post.publishedAt?.toISOString()}>
                        {post.publishedAt?.toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\//g, '.')}
                      </time>
                      {post.category && (
                        <>
                          <span className="text-border/60">·</span>
                          <span className="truncate">{post.category.title}</span>
                        </>
                      )}
                    </div>

                    {/* Title - fluid typography with proper scaling */}
                    <h3 className={`font-serif mb-3 sm:mb-4 group-hover:text-muted-foreground transition-colors duration-200 leading-snug ${
                      index === 0
                        ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
                        : 'text-xl sm:text-2xl md:text-3xl'
                    }`}>
                      {post.title}
                    </h3>

                    {/* Summary - responsive sizing */}
                    {post.summary && (
                      <p className={`text-muted-foreground/80 leading-relaxed ${
                        index === 0
                          ? 'text-sm sm:text-base md:text-lg mb-4 sm:mb-6'
                          : 'text-sm sm:text-base mb-3 sm:mb-4'
                      }`}>
                        {post.summary}
                      </p>
                    )}

                    {/* Tags - responsive wrapping */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                        {post.tags.slice(0, 3).map((pt) => (
                          <span
                            key={pt.tag.id}
                            className="text-xs text-muted-foreground/60 font-mono"
                          >
                            #{pt.tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* View all - touch-friendly */}
          {posts.length > 0 && (
            <div className="mt-12 sm:mt-14 md:mt-16 pt-6 sm:pt-8 border-t border-border/30">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground active:text-foreground transition-colors duration-200 font-mono group py-2 touch-manipulation"
              >
                <span>{t("viewAllWriting")}</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          )}
        </section>

        {/* Footer - responsive padding */}
        <footer className="pb-12 sm:pb-16 pt-6 sm:pt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-2xl">
            {t("footerNote")}
          </p>
        </footer>
      </div>
    </div>
  )
}
