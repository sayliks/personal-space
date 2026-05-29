"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCommentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export async function createComment(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()

    const raw = {
      content: formData.get("content"),
      authorName: formData.get("authorName"),
      authorEmail: formData.get("authorEmail") || undefined,
      postId: formData.get("postId"),
      parentId: formData.get("parentId") || undefined,
    }

    const result = createCommentSchema.safeParse(raw)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
    }

    const { content, authorName, authorEmail, postId, parentId } = result.data

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } })
      if (!parent || parent.postId !== postId) {
        return { success: false, error: "Invalid parent comment" }
      }
    }

    const userId = session?.user?.id

    await prisma.comment.create({
      data: {
        content,
        authorName: userId ? (session.user.name ?? authorName) : authorName,
        authorEmail: userId ? (session.user.email ?? authorEmail ?? null) : (authorEmail || null),
        userId: userId ?? null,
        postId,
        parentId: parentId || null,
      },
    })

    revalidatePath(`/posts/${post.slug}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create comment:", error)
    return { success: false, error: "Failed to create comment" }
  }
}
