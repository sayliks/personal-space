import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { createPostSchema } from "@/lib/validations"
import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = createPostSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { title, content, summary, coverImage, published, categoryId, tags } = result.data;

  let slug = generateSlug(title)

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  try {
    const post = await prisma.post.create({
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
          ? { create: tags.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Failed to create post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

const updatePostSchema = z.object({ id: z.string().cuid() })

export async function PUT(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { id, ...fields } = body as Record<string, unknown>
  const idResult = updatePostSchema.safeParse({ id })
  if (!idResult.success) {
    return NextResponse.json({ error: "Valid ID is required" }, { status: 400 })
  }
  const postId = idResult.data.id

  const result = createPostSchema.partial().safeParse(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { title, content, summary, coverImage, published, categoryId, tags } = result.data;

  const existing = await prisma.post.findUnique({ where: { id: postId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let slug = existing.slug
  if (title && title !== existing.title) {
    slug = generateSlug(title)
    const duplicate = await prisma.post.findUnique({ where: { slug } })
    if (duplicate && duplicate.id !== postId) {
      slug = `${slug}-${Date.now().toString(36)}`
    }
  }

  const publishedAt = published && !existing.publishedAt ? new Date() : existing.publishedAt

  try {
    const post = await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({ where: { postId } })

      return tx.post.update({
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
            ? { create: tags.map((tagId: string) => ({ tagId })) }
            : undefined,
        },
        include: { category: true, tags: { include: { tag: true } } },
      })
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Failed to update post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const idResult = z.string().cuid().safeParse(id)
  if (!idResult.success) return NextResponse.json({ error: "Valid ID is required" }, { status: 400 })

  try {
    await prisma.post.delete({ where: { id: idResult.data } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
