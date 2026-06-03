"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { createPostSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { handleActionError } from "@/lib/action-error"

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
    const existing = await prisma.document.findFirst({ where: { slug, type: "POST" } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    await prisma.document.create({
      data: {
        title,
        slug,
        content: content ?? "",
        summary: summary ?? null,
        coverImage: coverImage ?? null,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        type: "POST",
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
    return handleActionError(error, "Failed to create post")
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
      published: formData.get("published") ? formData.get("published") === "true" : undefined,
    }

    const result = createPostSchema.omit({ tags: true }).partial().safeParse(raw)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
    }

    const { title, content, summary, coverImage, published, categoryId } = result.data

    // Three-case tag contract. FormData can't encode "field absent" for a
    // multi-value key (getAll always yields an array), so the client sends an
    // explicit `tagsProvided` marker when it is managing tags:
    //   marker absent      -> preserve existing tags (skip the relation write)
    //   marker present, [] -> clear all tags
    //   marker present,[..] -> replace with the given set
    const tagsProvided = formData.has("tagsProvided")
    const newTagIds = formData.getAll("tags").map(String)
    if (tagsProvided) {
      const tagsResult = z.array(z.string()).safeParse(newTagIds)
      if (!tagsResult.success) {
        return { success: false, error: tagsResult.error.issues[0].message }
      }
    }

    const existing = await prisma.document.findFirst({ where: { id: postId, type: "POST" } })
    if (!existing) {
      return { success: false, error: "Post not found" }
    }

    let slug = existing.slug
    if (title && title !== existing.title) {
      slug = generateSlug(title)
      const duplicate = await prisma.document.findFirst({ where: { slug, type: "POST" } })
      if (duplicate && duplicate.id !== postId) {
        slug = `${slug}-${Date.now().toString(36)}`
      }
    }

    const publishedAt = published && !existing.publishedAt ? new Date() : existing.publishedAt

    await prisma.$transaction(async (tx) => {
      if (tagsProvided) {
        await tx.documentTag.deleteMany({ where: { documentId: postId } })
      }

      await tx.document.update({
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
          tags: tagsProvided && newTagIds.length
            ? { create: newTagIds.map((tagId) => ({ tagId })) }
            : undefined,
        },
      })
    })

    revalidatePath("/admin/posts")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return handleActionError(error, "Failed to update post")
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    const idResult = z.string().cuid().safeParse(id)
    if (!idResult.success) {
      return { success: false, error: "Valid ID is required" }
    }

    await prisma.document.delete({ where: { id: idResult.data, type: "POST" } })

    revalidatePath("/admin/posts")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return handleActionError(error, "Failed to delete post")
  }
}
