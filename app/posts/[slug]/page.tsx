import { getPostBySlug } from "@/lib/queries"
import { notFound } from "next/navigation"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { CategoryBadge } from "@/components/blog/CategoryBadge"
import { TagList } from "@/components/blog/TagBadge"
import { CommentSection } from "@/components/blog/CommentSection"
import { formatDateLong } from "@/lib/utils"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Not Found" }
  return {
    title: post.title,
    description: post.summary ?? undefined,
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Debug: Post not found</h1>
        <p className="mt-2">Slug from params: <code className="bg-muted px-1 rounded">{slug}</code></p>
      </div>
    )
  }

  if (!post.published) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-orange-600">Debug: Post found but not published</h1>
        <p className="mt-2">Title: {post.title}</p>
        <p className="mt-1">Slug: <code className="bg-muted px-1 rounded">{post.slug}</code></p>
        <p className="mt-1">Published: {String(post.published)}</p>
      </div>
    )
  }

  const tags = post.tags.map((pt) => pt.tag)

  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt ? formatDateLong(post.publishedAt) : "Draft"}
          </time>
          {post.category && (
            <CategoryBadge name={post.category.name} slug={post.category.slug} />
          )}
        </div>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        {post.summary && (
          <p className="text-lg text-muted-foreground">{post.summary}</p>
        )}
        {tags.length > 0 && <TagList tags={tags} />}
        <div className="text-sm text-muted-foreground">
          by {post.author.name}
        </div>
      </header>

      {post.content && <MarkdownRenderer content={post.content} />}

      <CommentSection postId={post.id} />
    </article>
  )
}
