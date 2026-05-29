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

  // Get featured posts
  const { posts } = await getPublishedPosts({ page: 1, pageSize: 3 })

  // Get categories
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen relative">
      {/* Layered atmospheric background */}
      <div className="fixed inset-0 -z-10">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:64px_64px]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)'
          }}
        />
        {/* Soft glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Hero - Asymmetric and personal */}
        <header className="pt-32 pb-20 md:pt-40 md:pb-24">
          <div className="max-w-2xl">
            {/* Avatar with subtle animation */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/80 to-muted/40 border border-border/30 flex items-center justify-center text-xl font-serif mb-10 backdrop-blur-sm hover:scale-105 transition-transform duration-500">
              S
            </div>

            {/* Name - oversized */}
            <h1 className="text-5xl md:text-7xl font-serif mb-8 tracking-tight leading-[0.95] text-balance">
              {t("heroName")}
            </h1>

            {/* Intro - editorial spacing */}
            <div className="space-y-6 text-muted-foreground/90 leading-relaxed">
              <p className="text-lg md:text-xl">
                {t("heroIntro")}
              </p>
            </div>

            {/* Currently section - living element */}
            <div className="mt-12 pt-8 border-t border-border/20">
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground/50 font-mono">
                    {t("currentlyLabel")}
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground/70 leading-relaxed pl-0.5">
                  {t("currentlyExploring")}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation - subtle and spaced */}
        <nav className="flex gap-8 text-sm mb-32 md:mb-40 text-muted-foreground/60">
          <Link href="/posts" className="hover:text-foreground transition-colors duration-300">
            {t("navThinking")}
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors duration-300">
            {t("navAbout")}
          </Link>
          <Link href="/search" className="hover:text-foreground transition-colors duration-300">
            {t("navExplore")}
          </Link>
        </nav>

        {/* Knowledge pathways - organic layout */}
        {categories.length > 0 && (
          <section className="mb-32 md:mb-40">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-16 font-mono">
              {t("gardenPaths")}
            </h2>

            {/* Asymmetric grid */}
            <div className="space-y-6">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block p-8 border border-border/20 hover:border-border/40 bg-card/20 hover:bg-card/30 backdrop-blur-sm transition-all duration-500 rounded-lg hover:translate-x-1"
                  style={{
                    marginLeft: index % 2 === 1 ? '2rem' : '0',
                    maxWidth: index === 0 ? '100%' : '90%'
                  }}
                >
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-xl font-medium group-hover:text-foreground transition-colors duration-300">
                      {category.title}
                    </h3>
                    <span className="text-xs text-muted-foreground/50 font-mono">
                      {category._count.documents}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">
                    {t(`categoryDesc.${category.slug}`, { defaultValue: t("categoryDescDefault") })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent thinking - editorial and varied */}
        <section className="mb-32 md:mb-40">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-16 font-mono">
            {t("recentThinking")}
          </h2>

          {posts.length === 0 ? (
            <p className="text-muted-foreground/50 italic text-sm">
              {t("noPostsYet")}
            </p>
          ) : (
            <div className="space-y-20">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className="group"
                  style={{
                    marginLeft: index === 1 ? '3rem' : '0',
                    maxWidth: index === 1 ? '85%' : '100%'
                  }}
                >
                  <Link href={`/posts/${post.slug}`} className="block">
                    {/* Metadata - subtle */}
                    <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground/40 font-mono">
                      <time dateTime={post.publishedAt?.toISOString()}>
                        {post.publishedAt?.toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\//g, '.')}
                      </time>
                      {post.category && (
                        <>
                          <span className="text-border/40">·</span>
                          <span>{post.category.title}</span>
                        </>
                      )}
                    </div>

                    {/* Title - varied sizing */}
                    <h3 className={`font-serif mb-5 group-hover:text-muted-foreground/80 transition-colors duration-300 leading-[1.1] tracking-tight ${
                      index === 0
                        ? 'text-4xl md:text-5xl'
                        : index === 1
                        ? 'text-2xl md:text-3xl'
                        : 'text-3xl md:text-4xl'
                    }`}>
                      {post.title}
                    </h3>

                    {/* Summary - varied emphasis */}
                    {post.summary && (
                      <p className={`text-muted-foreground/70 leading-relaxed ${
                        index === 0 ? 'text-lg mb-6' : 'text-base mb-5'
                      }`}>
                        {post.summary}
                      </p>
                    )}

                    {/* Tags - minimal */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-4 mt-5">
                        {post.tags.slice(0, 3).map((pt) => (
                          <span
                            key={pt.tag.id}
                            className="text-xs text-muted-foreground/40 font-mono hover:text-muted-foreground/60 transition-colors"
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

          {/* Explore more - subtle */}
          {posts.length > 0 && (
            <div className="mt-20 pt-10 border-t border-border/20">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300 font-mono group"
              >
                <span>{t("exploreGarden")}</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          )}
        </section>

        {/* Footer - personal note */}
        <footer className="pb-20 pt-12 border-t border-border/20">
          <div className="space-y-6 text-sm text-muted-foreground/50 leading-relaxed max-w-2xl">
            <p>{t("footerNote")}</p>
            <p className="text-xs text-muted-foreground/30 font-mono">
              {t("footerMeta")}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
