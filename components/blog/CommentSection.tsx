import { getCommentsByPostId } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
import { CommentForm } from "@/components/blog/CommentForm"
import { formatDate } from "@/lib/utils"

export async function CommentSection({ postId }: { postId: string }) {
  const t = await getTranslations("post")
  const comments = await getCommentsByPostId(postId)

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-6">
        {t("comments")}{comments.length > 0 && ` (${comments.length})`}
      </h2>

      {comments.length > 0 && (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-0">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{comment.content}</p>
              {comment.replies.length > 0 && (
                <div className="ml-4 mt-3 space-y-3 border-l-2 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id}>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="font-medium">{reply.authorName}</span>
                        <span className="text-muted-foreground">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CommentForm postId={postId} />
    </section>
  )
}
