import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getAllPosts } from "@/lib/queries"
import { DeletePostButton } from "./DeletePostButton"

export default async function StudioWritingPage() {
  const t = await getTranslations("studio")
  const posts = await getAllPosts()

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-medium mb-2">
            {t("writingTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("writingSubtitle")}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded text-sm transition-colors"
        >
          <span>+</span>
          <span>{t("newWriting")}</span>
        </Link>
      </header>

      {/* List */}
      <section className="pt-6 border-t border-border/40">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noWritings")}
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="group flex items-baseline gap-4">
                {/* Date */}
                <time className="text-xs text-muted-foreground shrink-0 w-20">
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
                  <div className="flex items-baseline gap-2 mb-1">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-sm font-medium group-hover:text-muted-foreground transition-colors truncate"
                    >
                      {post.title || t("untitled")}
                    </Link>
                    <span
                      className={`shrink-0 text-xs ${
                        post.published
                          ? "text-muted-foreground/50"
                          : "text-primary/60"
                      }`}
                    >
                      {post.published ? t("published") : t("draft")}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{post.slug}</span>
                    {post.category && (
                      <>
                        <span>·</span>
                        <span className="shrink-0">{post.category.title}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("edit")}
                    </Link>
                    {post.published && (
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
