"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPhotoSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: { issues: Array<{ message: string }> } }

export async function createPhoto(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin()

  const raw = {
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
    order: Number(formData.get("order") || 0),
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    published: formData.get("published") === "true",
  }

  const result = createPhotoSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: { issues: result.error.issues } }
  }

  const { tags, ...photoData } = result.data

  const photo = await prisma.photo.create({
    data: {
      ...photoData,
      authorId: session.user.id!,
      tags: {
        create: tags.map(tagId => ({ tagId }))
      }
    }
  })

  revalidatePath("/")
  revalidatePath("/admin/photos")

  return { success: true, data: { id: photo.id } }
}

export async function updatePhoto(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin()

  const raw = {
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    description: formData.get("description"),
    order: Number(formData.get("order") || 0),
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    published: formData.get("published") === "true",
  }

  const result = createPhotoSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: { issues: result.error.issues } }
  }

  const { tags, ...photoData } = result.data

  await prisma.photo.update({
    where: { id },
    data: {
      ...photoData,
      tags: {
        deleteMany: {},
        create: tags.map(tagId => ({ tagId }))
      }
    }
  })

  revalidatePath("/")
  revalidatePath("/admin/photos")

  return { success: true }
}

export async function deletePhoto(formData: FormData): Promise<ActionResult> {
  await requireAdmin()

  const id = formData.get("id") as string

  await prisma.photo.delete({ where: { id } })

  revalidatePath("/")
  revalidatePath("/admin/photos")

  return { success: true }
}
