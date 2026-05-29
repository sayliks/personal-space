"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { createPostSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "admin" || !session.user.id) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAdmin()

    const raw = {
      title: formData.get("title"),
      content: formData.get("content"),
      summary: formData.get("summary") || undefined,
      coverImage: formData.get("coverImage") || undefined,
      categoryId: formData.get("categoryId") || undefined,
      tags: formData.getAll("tags"),
      published: formData.get("published") === "true",
    }

    const result = createPostSchema.safeParse(raw)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
    }

    const { title, content, summary, coverImage, published, categoryId, tags } = result.data

    let slug = generateSlug(title)
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    await prisma.post.create({
      data: {
        title,
        slug,
        content: content ?? "",
        summary: summary ?? null,
        coverImage: coverImage ?? null,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        categoryId: categoryId ?? null,
        tags: tags?.length
          ? { create: tags.map((tagId) => ({ tagId })) }
          : undefined,
      },
    })

    revalidatePath("/admin/posts")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" }
    }
    console.error("Failed to create post:", error)
    return { success: false, error: "Failed to create post" }
  }
}

export async function updatePost(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()

    const id = formData.get("id") as string
    const idResult = z.string().cuid().safeParse(id)
    if (!idResult.success) {
      return { success: false, error: "Valid ID is required" }
    }
    const postId = idResult.data

    const raw = {
      title: formData.get("title") || undefined,
      content: formData.get("content") || undefined,
      summary: formData.get("summary") || undefined,
      coverImage: formData.get("coverImage") || undefined,
      categoryId: formData.get("categoryId") || undefined,
      tags: formData.getAll("tags"),
      published: formData.get("published") ? formData.get("published") === "true" : undefined,
    }

    const result = createPostSchema.partial().safeParse(raw)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
    }

    const { title, content, summary, coverImage, published, categoryId, tags } = result.data

    const existing = await prisma.post.findUnique({ where: { id: postId } })
    if (!existing) {
      return { success: false, error: "Post not found" }
    }

    let slug = existing.slug
    if (title && title !== existing.title) {
      slug = generateSlug(title)
      const duplicate = await prisma.post.findUnique({ where: { slug } })
      if (duplicate && duplicate.id !== postId) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    const publishedAt = published && !existing.publishedAt ? new Date() : existing.publishedAt

    await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({ where: { postId } })

      await tx.post.update({
        where: { id: postId },
        data: {
          title: title ?? existing.title,
          slug,
          content: content !== undefined ? content : existing.content,
          summary: summary !== undefined ? summary : existing.summary,
          coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
          published: published ?? existing.published,
          publishedAt,
          categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
          tags: tags?.length
            ? { create: tags.map((tagId) => ({ tagId })) }
            : undefined,
        },
      })
    })

    revalidatePath("/admin/posts")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" }
    }
    console.error("Failed to update post:", error)
    return { success: false, error: "Failed to update post" }
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    const idResult = z.string().cuid().safeParse(id)
    if (!idResult.success) {
      return { success: false, error: "Valid ID is required" }
    }

    await prisma.post.delete({ where: { id: idResult.data } })

    revalidatePath("/admin/posts")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" }
    }
    console.error("Failed to delete post:", error)
    return { success: false, error: "Failed to delete post" }
  }
}
