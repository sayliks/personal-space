import { SearchForm } from "@/components/blog/SearchForm"
import { PostCard } from "@/components/blog/PostCard"
import { searchPosts } from "@/lib/queries"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Search blog posts",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const results = q ? await searchPosts(q) : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <SearchForm initialQuery={q ?? ""} />

      <div className="mt-8">
        {q ? (
          <>
            <p className="text-muted-foreground mb-6">
              {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{q}&quot;
            </p>
            <div className="space-y-8">
              {results.length === 0 ? (
                <p className="text-muted-foreground">No posts found.</p>
              ) : (
                results.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Enter a keyword to search.</p>
        )}
      </div>
    </div>
  )
}
