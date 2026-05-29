import { getPublishedPosts, getCategoryBySlug } from "@/lib/queries"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PostCard } from "@/components/blog/PostCard"
import { Pagination } from "@/components/blog/Pagination"

export const dynamic = "force-dynamic"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const [category, { posts, totalPages }] = await Promise.all([
    getCategoryBySlug(decodedSlug),
    getPublishedPosts({ page, categorySlug: decodedSlug }),
  ])

  if (!category) notFound()

  const t = await getTranslations("categories")

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t("title", { name: category.title })}</h1>
      <p className="text-muted-foreground mb-8">{t("postCount", { count: posts.length })}</p>
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} baseUrl={`/categories/${decodedSlug}`} />
    </div>
  )
}
