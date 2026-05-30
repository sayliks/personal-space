import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getAllPosts } from "@/lib/queries"
import { DeletePostButton } from "./DeletePostButton"

export default async function StudioWritingPage() {
  const t = await getTranslations("studio")
  const posts = await getAllPosts()

  return (
    <div className="space-y-16">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight leading-tight">
            {t("writingTitle")}
          </h1>
          <p className="text-muted-foreground/70 leading-relaxed max-w-xl">
            {t("writingSubtitle")}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-foreground/5 hover:bg-foreground/10 border border-border/20 hover:border-border/40 rounded-lg text-sm font-medium transition-all duration-300"
        >
          <span>+</span>
          <span>{t("newWriting")}</span>
        </Link>
      </header>

      {/* Timeline */}
      <section className="pt-8 border-t border-border/20">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 italic">
            {t("noWritings")}
          </p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.id} className="group flex items-baseline gap-6">
                {/* Hanging date */}
                <time className="text-xs text-muted-foreground/40 font-mono shrink-0 w-20 pt-1">
                  {(post.publishedAt ?? post.createdAt)
                    .toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                    .replace(/\//g, ".")}
                </time>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-lg font-serif tracking-tight group-hover:text-muted-foreground transition-colors duration-300 truncate"
                    >
                      {post.title || t("untitled")}
                    </Link>
                    <span
                      className={`shrink-0 text-xs font-mono ${
                        post.published
                          ? "text-muted-foreground/40"
                          : "text-primary/60"
                      }`}
                    >
                      {post.published ? t("published") : t("draft")}
                    </span>
                  </div>

                  {/* Meta line: slug + category */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/40 font-mono">
                    <span className="truncate">{post.slug}</span>
                    {post.category && (
                      <>
                        <span className="text-border/40">·</span>
                        <span className="shrink-0">{post.category.title}</span>
                      </>
                    )}
                  </div>

                  {/* Actions — appear on hover */}
                  <div className="flex items-center gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-xs text-muted-foreground/50 hover:text-foreground font-mono transition-colors"
                    >
                      {t("edit")}
                    </Link>
                    {post.published && (
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="text-xs text-muted-foreground/50 hover:text-foreground font-mono transition-colors"
                      >
                        {t("view")}
                      </Link>
                    )}
                    <DeletePostButton postId={post.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
