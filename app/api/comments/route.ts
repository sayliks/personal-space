import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCommentSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await auth()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = createCommentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { content, authorName, authorEmail, postId, parentId } = result.data

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 })
    }
  }

  const userId = session?.user?.id

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        authorName: userId ? (session.user.name ?? authorName) : authorName,
        authorEmail: userId ? (session.user.email ?? authorEmail ?? null) : (authorEmail || null),
        userId: userId ?? null,
        postId,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Failed to create comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const approved = searchParams.get("approved")

  try {
    const comments = await prisma.comment.findMany({
      where: {
        approved: approved === "false" ? false : true,
      },
      include: { post: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
