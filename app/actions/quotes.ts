"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { createQuoteSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { ActionResult } from "./posts"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "admin" || !session.user.id) {
    throw new Error("Unauthorized")
  }
  return session
}

function quoteTitle(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 80)
}

async function uniqueQuoteSlug(content: string, currentId?: string) {
  const base = generateSlug(quoteTitle(content))
  const existing = await prisma.document.findFirst({ where: { slug: base } })

  if (!existing || existing.id === currentId) {
    return base
  }

  return `${base}-${Date.now().toString(36)}`
}

export async function createQuote(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAdmin()

    const raw = {
      content: formData.get("content"),
      published: formData.get("published") === "true",
    }

    const result = createQuoteSchema.safeParse(raw)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
    }

    const { content, published } = result.data
    const title = quoteTitle(content)
    const slug = await uniqueQuoteSlug(content)

    await prisma.document.create({
      data: {
        title,
        slug,
        content,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        type: "NOTE",
        authorId: session.user.id,
      },
    })

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/quotes")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" }
    }
    console.error("Failed to create quote:", error)
    return { success: false, error: "Failed to create quote" }
  }
}

export async function updateQuote(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin()

    const idResult = z.string().cuid().safeParse(formData.get("id"))
    if (!idResult.success) {
      return { success: false, error: "Valid ID is required" }
    }

    const raw = {
      content: formData.get("content"),
      published: formData.get("published") === "true",
    }

    const result = createQuoteSchema.safeParse(raw)
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message }
    }

    const quoteId = idResult.data
    const existing = await prisma.document.findFirst({ where: { id: quoteId, type: "NOTE" } })
    if (!existing) {
      return { success: false, error: "Quote not found" }
    }

    const { content, published } = result.data
    const title = quoteTitle(content)
    const slug = content !== existing.content ? await uniqueQuoteSlug(content, quoteId) : existing.slug
    const publishedAt = published && !existing.publishedAt ? new Date() : existing.publishedAt

    await prisma.document.update({
      where: { id: quoteId },
      data: {
        title,
        slug,
        content,
        published: published ?? existing.published,
        publishedAt,
      },
    })

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/quotes")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" }
    }
    console.error("Failed to update quote:", error)
    return { success: false, error: "Failed to update quote" }
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  try {
    await requireAdmin()

    const idResult = z.string().cuid().safeParse(id)
    if (!idResult.success) {
      return { success: false, error: "Valid ID is required" }
    }

    const existing = await prisma.document.findFirst({ where: { id: idResult.data, type: "NOTE" } })
    if (!existing) {
      return { success: false, error: "Quote not found" }
    }

    await prisma.document.delete({ where: { id: idResult.data } })

    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/quotes")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Unauthorized" }
    }
    console.error("Failed to delete quote:", error)
    return { success: false, error: "Failed to delete quote" }
  }
}
