import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/slug"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { title, content, summary, coverImage, published, categoryId, tags } = body

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 })

  let slug = generateSlug(title)

  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content: content ?? "",
      summary: summary ?? null,
      coverImage: coverImage ?? null,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      authorId: session.user.id!,
      categoryId: categoryId ?? null,
      tags: tags?.length
        ? { create: tags.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: { category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json(post)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { id, title, content, summary, coverImage, published, categoryId, tags } = body

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let slug = existing.slug
  if (title && title !== existing.title) {
    slug = generateSlug(title)
    const duplicate = await prisma.post.findUnique({ where: { slug } })
    if (duplicate && duplicate.id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`
    }
  }

  const publishedAt = published && !existing.publishedAt ? new Date() : existing.publishedAt

  await prisma.postTag.deleteMany({ where: { postId: id } })

  const post = await prisma.post.update({
    where: { id },
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

  return NextResponse.json(post)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

  await prisma.post.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
