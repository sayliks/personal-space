import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCommentSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const result = createCommentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { content, authorName, authorEmail, postId, parentId, userId } = result.data

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

  const session = await auth()
  const isAuthenticated = session?.user?.id && userId === session.user.id

  const comment = await prisma.comment.create({
    data: {
      content,
      authorName: isAuthenticated ? (session.user.name ?? authorName) : authorName,
      authorEmail: isAuthenticated ? (session.user.email ?? authorEmail ?? null) : (authorEmail || null),
      userId: isAuthenticated ? session.user.id : null,
      postId,
      parentId: parentId || null,
    },
  })

  return NextResponse.json(comment)
}

export async function GET(request: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const approved = searchParams.get("approved")

  const comments = await prisma.comment.findMany({
    where: {
      approved: approved === "false" ? false : true,
    },
    include: { post: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(comments)
}
