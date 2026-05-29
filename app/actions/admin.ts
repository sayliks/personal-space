"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { createCategorySchema, createTagSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }
}

const cuidSchema = z.string().cuid()

export async function createCategory(formData: FormData) {
  await requireAdmin()

  const raw = { name: formData.get("name") }
  const result = createCategorySchema.safeParse(raw)
  if (!result.success) return

  const slug = generateSlug(result.data.name)

  // Get admin user for authorId
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.document.create({
    data: {
      title: result.data.name,
      slug,
      type: "CATEGORY",
      published: true,
      publishedAt: new Date(),
      authorId: session.user.id,
    },
  })
  revalidatePath("/admin/categories")
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin()

  const idResult = cuidSchema.safeParse(formData.get("id"))
  if (!idResult.success) return

  await prisma.document.delete({ where: { id: idResult.data, type: "CATEGORY" } })
  revalidatePath("/admin/categories")
}

export async function createTag(formData: FormData) {
  await requireAdmin()

  const raw = { name: formData.get("name") }
  const result = createTagSchema.safeParse(raw)
  if (!result.success) return

  const slug = generateSlug(result.data.name)
  await prisma.tag.create({ data: { name: result.data.name, slug } })
  revalidatePath("/admin/tags")
}

export async function deleteTag(formData: FormData) {
  await requireAdmin()

  const idResult = cuidSchema.safeParse(formData.get("id"))
  if (!idResult.success) return

  await prisma.tag.delete({ where: { id: idResult.data } })
  revalidatePath("/admin/tags")
}

export async function approveComment(formData: FormData) {
  await requireAdmin()

  const idResult = cuidSchema.safeParse(formData.get("id"))
  if (!idResult.success) return

  await prisma.comment.update({ where: { id: idResult.data }, data: { approved: true } })
  revalidatePath("/admin/comments")
}

export async function deleteComment(formData: FormData) {
  await requireAdmin()

  const idResult = cuidSchema.safeParse(formData.get("id"))
  if (!idResult.success) return

  await prisma.comment.delete({ where: { id: idResult.data } })
  revalidatePath("/admin/comments")
}
