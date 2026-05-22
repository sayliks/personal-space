import { getTranslations } from "next-intl/server"
import { SearchForm } from "@/components/blog/SearchForm"
import { PostCard } from "@/components/blog/PostCard"
import { searchPosts } from "@/lib/queries"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Search",
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const t = await getTranslations("search")
  const { q } = await searchParams
  const results = q ? await searchPosts(q) : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <SearchForm initialQuery={q ?? ""} />

      <div className="mt-8">
        {q ? (
          <>
            <p className="text-muted-foreground mb-6">
              {t("results", { count: results.length, query: q })}
            </p>
            <div className="space-y-8">
              {results.length === 0 ? (
                <p className="text-muted-foreground">{t("noResults")}</p>
              ) : (
                results.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">{t("noQuery")}</p>
        )}
      </div>
    </div>
  )
}
