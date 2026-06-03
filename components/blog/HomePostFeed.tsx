"use client"

/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { formatDateShort, formatDateDots } from "@/lib/utils"

const POST_REVISIT_THRESHOLD_MS = 24 * 60 * 60 * 1000

export type HomePostFeedItem = {
  id: string
  title: string
  slug: string
  summary: string | null
  coverImage: string | null
  publishedAt: string | null
  updatedAt: string
  category: {
    title: string
  } | null
}

type HomePostFeedLabels = {
  noItems: string
  loadMore: string
  loadingMore: string
  allLoaded: string
  tended: string
}

type HomePostFeedProps = {
  initialPosts: HomePostFeedItem[]
  pageSize: number
  total: number
  labels: HomePostFeedLabels
}

export function HomePostFeed({
  initialPosts,
  pageSize,
  total,
  labels,
}: HomePostFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasMore = posts.length < total

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return
    }

    setIsLoading(true)

    try {
      const nextPage = page + 1
      const response = await fetch(
        `/api/home/posts?page=${nextPage}&pageSize=${pageSize}`
      )

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as {
        posts: HomePostFeedItem[]
      }

      setPosts((current) => [...current, ...data.posts])
      setPage(nextPage)
    } finally {
      setIsLoading(false)
    }
  }, [hasMore, isLoading, page, pageSize])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: "320px 0px" }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (posts.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground/50">
        {labels.noItems}
      </p>
    )
  }

  return (
    <div className="home-feed">
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id} className="home-post-card">
            <Link href={`/posts/${post.slug}`} className="home-post-card-link">
              {post.coverImage && (
                <span className="home-post-cover" aria-hidden="true">
                  <img src={post.coverImage} alt="" loading="lazy" />
                </span>
              )}

              <span className="home-post-body">
                <span className="home-post-meta">
                  <time dateTime={post.publishedAt ?? undefined}>
                    {formatDateDots(post.publishedAt)}
                  </time>
                  {post.category && <span>{post.category.title}</span>}
                  {isPostRevisited(post) && (
                    <span>
                      {labels.tended} {formatDateShort(post.updatedAt)}
                    </span>
                  )}
                </span>

                <span className="home-post-title">{post.title}</span>

                {post.summary && (
                  <span className="home-post-summary">{post.summary}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="home-feed-more" ref={sentinelRef}>
        {hasMore ? (
          <button
            type="button"
            className="home-feed-more-button"
            disabled={isLoading}
            onClick={loadMore}
          >
            {isLoading ? labels.loadingMore : labels.loadMore}
          </button>
        ) : total > 0 ? (
          <span className="home-feed-complete">{labels.allLoaded}</span>
        ) : null}
      </div>
    </div>
  )
}

function isPostRevisited(post: HomePostFeedItem) {
  if (!post.publishedAt) {
    return false
  }

  return (
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() >
    POST_REVISIT_THRESHOLD_MS
  )
}
