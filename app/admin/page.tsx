import { getTranslations } from "next-intl/server"
import { getStudioStats, getRecentPosts } from "@/lib/queries"
import Link from "next/link"

export default async function StudioDashboard() {
  const t = await getTranslations("studio")

  const [{ postCount, categoryCount, tagCount, pendingComments }, recentPosts] =
    await Promise.all([getStudioStats(), getRecentPosts(5)])

  return (
    <div className="space-y-12">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-medium mb-2">
          {t("welcome")}
        </h1>
      </header>

      {/* Garden overview */}
      <section>
        <h2 className="text-xs text-muted-foreground mb-6">
          {t("gardenOverview")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link
            href="/admin/posts"
            className="group block space-y-1 hover:translate-x-0.5 transition-transform"
          >
            <div className="text-2xl font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {postCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("writings")}
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="group block space-y-1 hover:translate-x-0.5 transition-transform"
          >
            <div className="text-2xl font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {categoryCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("knowledgePaths")}
            </div>
          </Link>

          <Link
            href="/admin/tags"
            className="group block space-y-1 hover:translate-x-0.5 transition-transform"
          >
            <div className="text-2xl font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {tagCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("connections")}
            </div>
          </Link>

          <Link
            href="/admin/comments"
            className="group block space-y-1 hover:translate-x-0.5 transition-transform"
          >
            <div className="text-2xl font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {pendingComments}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("pendingResponses")}
            </div>
          </Link>
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-xs text-muted-foreground mb-6">
          {t("recentActivity")}
        </h2>

        <div className="space-y-4">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}/edit`}
              className="group block"
            >
              <div className="flex items-baseline gap-3">
                <time className="text-xs text-muted-foreground shrink-0 w-16">
                  {post.updatedAt.toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '.')}
                </time>
                <div className="flex-1 flex items-baseline gap-2">
                  <h3 className="text-sm group-hover:text-muted-foreground transition-colors">
                    {post.title}
                  </h3>
                  <span className={`text-xs ${
                    post.published
                      ? 'text-muted-foreground/50'
                      : 'text-primary/60'
                  }`}>
                    {post.published ? t("published") : t("draft")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentPosts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("noRecentActivity")}
          </p>
        )}
      </section>

      {/* Quick actions */}
      <section className="pt-6 border-t border-border/40">
        <div className="flex gap-3">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded text-sm transition-colors"
          >
            <span>+</span>
            <span>{t("newWriting")}</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border/40 hover:border-border rounded text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>→</span>
            <span>{t("viewGarden")}</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
