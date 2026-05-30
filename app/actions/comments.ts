"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCommentSchema } from "@/lib/validations"
import { moderateComment } from "@/lib/moderation"
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

    const post = await prisma.document.findFirst({ where: { id: postId, type: "POST" } })
    if (!post) {
      return { success: false, error: "Post not found" }
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } })
      if (!parent || parent.documentId !== postId) {
        return { success: false, error: "Invalid parent comment" }
      }
    }

    const userId = session?.user?.id

    // Trust signal: how old is the commenter's account (logged-in users only).
    let accountAgeDays: number | null = null
    if (userId) {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      })
      if (u) {
        accountAgeDays = Math.floor((Date.now() - u.createdAt.getTime()) / 86_400_000)
      }
    }

    // Advisory moderation — never throws; null/failure -> flag-for-review.
    const outcome = await moderateComment(content, accountAgeDays)

    await prisma.comment.create({
      data: {
        content,
        authorName: userId ? (session.user.name ?? authorName) : authorName,
        authorEmail: userId ? (session.user.email ?? authorEmail ?? null) : (authorEmail || null),
        userId: userId ?? null,
        documentId: postId,
        parentId: parentId || null,
        approved: false,
        moderationLabel: outcome.label,
        moderationScore: outcome.score,
        moderationReason: outcome.reason,
        moderationAction: outcome.action,
        moderatedAt: new Date(),
      },
    })

    revalidatePath(`/posts/${post.slug}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create comment:", error)
    return { success: false, error: "Failed to create comment" }
  }
}
