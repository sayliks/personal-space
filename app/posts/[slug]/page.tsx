import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Backlinks } from "@/components/blog/Backlinks"
import { ArticleToc } from "@/components/blog/ArticleToc"
import { CommentSection } from "@/components/blog/CommentSection"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { RelatedNotes } from "@/components/blog/RelatedNotes"
import { isPostRevisited } from "@/lib/posts/revision-status"
import { getPostBySlug } from "@/lib/queries"
import { formatDateLong } from "@/lib/utils"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

function renderTitle(title: string) {
  if (typeof Intl.Segmenter === "undefined") {
    return title.split(/(人生)/).map((part, index) =>
      part === "人生" ? (
        <span key={index} className="inline-block whitespace-nowrap">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  const segments = Array.from(new Intl.Segmenter("zh", { granularity: "word" }).segment(title))

  return segments.map((segment, index) => {
    const text = segment.segment
    if (!text.trim()) return text

    return segment.isWordLike || text === "人生" ? (
      <span key={index} className="inline-block whitespace-nowrap">
        {text}
      </span>
    ) : (
      text
    )
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getPostBySlug(decodeURIComponent(slug))
    if (!post) return { title: "Not Found" }
    return {
      title: post.title,
      description: post.summary ?? undefined,
    }
  } catch {
    return { title: "Not Found" }
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = await getPostBySlug(decodedSlug)

  const t = await getTranslations("post")

  if (!post || !post.published) {
    notFound()
  }

  const tags = post.tags.map((pt) => pt.tag)

  return (
    <article className="relative">
      <header className="mx-auto max-w-190 px-5 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:pt-24">
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase text-muted-foreground/38">
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt ? formatDateLong(post.publishedAt) : t("draft")}
          </time>
          {isPostRevisited(post) && (
            <>
              <span className="text-border/50">/</span>
              <time dateTime={post.updatedAt.toISOString()}>
                {t("updated")} {formatDateLong(post.updatedAt)}
              </time>
            </>
          )}
          {post.category && (
            <>
              <span className="text-border/50">/</span>
              <Link
                href={`/categories/${post.category.slug}`}
                className="transition-colors hover:text-foreground/80"
              >
                {post.category.title}
              </Link>
            </>
          )}
          <span className="text-border/50">/</span>
          <span>{post.author.name}</span>
        </div>

        <h1 className="article-title max-w-180 font-serif font-medium text-foreground/95">
          {renderTitle(post.title)}
        </h1>

        {post.summary && (
          <p className="mt-5 max-w-170 font-serif text-lg leading-[1.85] text-muted-foreground/75 sm:text-xl">
            {post.summary}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="font-mono text-[11px] lowercase text-muted-foreground/45 transition-colors hover:text-foreground/75"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      <ArticleToc />

      <div className="mx-auto max-w-182 px-5 pb-8 sm:px-6">
        <div className="mb-9 h-px bg-linear-to-r from-transparent via-border/28 to-transparent" />
        {post.content && <MarkdownRenderer content={post.content} />}
      </div>

      <div className="mx-auto max-w-182 px-5 pb-10 sm:px-6">
        <Suspense>
          <Backlinks postId={post.id} />
        </Suspense>
      </div>

      <div className="mx-auto max-w-182 px-5 pb-10 sm:px-6">
        <Suspense>
          <RelatedNotes postId={post.id} tags={tags} categoryId={post.categoryId} />
        </Suspense>
      </div>

      <div className="mx-auto max-w-182 px-5 pb-16 sm:px-6 sm:pb-20">
        <Suspense>
          <CommentSection postId={post.id} />
        </Suspense>
      </div>
    </article>
  )
}
