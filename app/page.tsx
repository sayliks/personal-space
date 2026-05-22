import { getTranslations } from "next-intl/server"
import { getPublishedPosts } from "@/lib/queries"
import { PostCard } from "@/components/blog/PostCard"
import { Pagination } from "@/components/blog/Pagination"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const t = await getTranslations("home")
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const { posts, totalPages } = await getPublishedPosts({ page })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
      <div className="space-y-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">{t("noPosts")}</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} baseUrl="/" />
    </div>
  )
}
