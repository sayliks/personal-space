import { getTranslations } from "next-intl/server"
import { getPendingComments } from "@/lib/queries"
import { approveComment, deleteComment } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default async function AdminCommentsPage() {
  const t = await getTranslations("admin")
  const comments = await getPendingComments()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("comments")}</h1>

      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-sm font-medium">{t("author")}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t("content")}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t("mod.aiVerdict")}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t("post")}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t("date")}</th>
              <th className="text-right px-4 py-3 text-sm font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noPendingComments")}
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className="border-b last:border-0">
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
                      <form action={approveComment}>
                        <input type="hidden" name="id" value={comment.id} />
                        <Button variant="outline" size="sm" type="submit">
                          {t("approve")}
                        </Button>
                      </form>
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
