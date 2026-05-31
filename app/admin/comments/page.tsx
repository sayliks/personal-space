import { getTranslations } from "next-intl/server"
import { getAllComments } from "@/lib/queries"
import { approveComment, deleteComment } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function AdminCommentsPage() {
  const t = await getTranslations("admin")
  const comments = await getAllComments()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-medium">{t("comments")}</h1>
      </header>

      <div className="border border-border/40 rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium">{t("status")}</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium">{t("author")}</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium">{t("content")}</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium">{t("mod.aiVerdict")}</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium">{t("post")}</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium">{t("date")}</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("noPendingComments")}
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      comment.approved
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {comment.approved ? t("approved") : t("pendingComments")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{comment.authorName}</div>
                    {comment.authorEmail && (
                      <div className="text-muted-foreground text-xs">{comment.authorEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">
                    {comment.content}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs">
                    {comment.moderationLabel ? (
                      <>
                        <span
                          className={
                            comment.moderationAction === "reject"
                              ? "font-medium text-destructive"
                              : comment.moderationAction === "flag-for-review"
                                ? "font-medium text-amber-600 dark:text-amber-500"
                                : "font-medium text-emerald-600 dark:text-emerald-500"
                          }
                        >
                          {t(`mod.${comment.moderationLabel}`)} · {Math.round((comment.moderationScore ?? 0) * 100)}%
                        </span>
                        {comment.moderationReason && (
                          <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                            {comment.moderationReason}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">{t("mod.unmoderated")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/posts/${comment.document.slug}`}
                      className="text-primary hover:underline"
                    >
                      {comment.document.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!comment.approved && (
                        <form action={approveComment}>
                          <input type="hidden" name="id" value={comment.id} />
                          <Button variant="outline" size="sm" type="submit">
                            {t("approve")}
                          </Button>
                        </form>
                      )}
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={comment.id} />
                        <Button variant="destructive" size="sm" type="submit">
                          {t("delete")}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
