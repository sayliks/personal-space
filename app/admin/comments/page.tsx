import { getPendingComments } from "@/lib/queries"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

async function approveComment(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await prisma.comment.update({ where: { id }, data: { approved: true } })
  revalidatePath("/admin/comments")
}

async function deleteComment(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await prisma.comment.delete({ where: { id } })
  revalidatePath("/admin/comments")
}

export default async function AdminCommentsPage() {
  const comments = await getPendingComments()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comments</h1>

      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-sm font-medium">Author</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Content</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Post</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No pending comments.
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
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/posts/${comment.post.slug}`}
                      className="text-primary hover:underline"
                    >
                      {comment.post.title}
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
                          Approve
                        </Button>
                      </form>
                      <form action={deleteComment}>
                        <input type="hidden" name="id" value={comment.id} />
                        <Button variant="destructive" size="sm" type="submit">
                          Delete
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
