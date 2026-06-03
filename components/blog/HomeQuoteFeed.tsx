"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { QuoteContent } from "@/components/blog/QuoteContent"
import { formatDateDots } from "@/lib/utils"

export type HomeQuoteFeedItem = {
  id: string
  title: string
  content: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type HomeQuoteFeedLabels = {
  noItems: string
  loadMore: string
  loadingMore: string
  allLoaded: string
}

type HomeQuoteFeedProps = {
  initialQuotes: HomeQuoteFeedItem[]
  pageSize: number
  total: number
  labels: HomeQuoteFeedLabels
}

export function HomeQuoteFeed({
  initialQuotes,
  pageSize,
  total,
  labels,
}: HomeQuoteFeedProps) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasMore = quotes.length < total

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) {
      return
    }

    setIsLoading(true)

    try {
      const nextPage = page + 1
      const response = await fetch(
        `/api/home/quotes?page=${nextPage}&pageSize=${pageSize}`
      )

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as {
        quotes: HomeQuoteFeedItem[]
      }

      setQuotes((current) => [...current, ...data.quotes])
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

  if (quotes.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground/50">
        {labels.noItems}
      </p>
    )
  }

  return (
    <div className="home-feed">
      <ul className="space-y-4">
        {quotes.map((quote) => {
          const title = getVisibleTitle(quote)

          return (
            <li key={quote.id} className="home-quote-card">
              <time
                dateTime={(quote.publishedAt ?? quote.createdAt) || undefined}
                className="home-feed-date"
              >
                {formatDateDots(quote.publishedAt ?? quote.createdAt)}
              </time>
              <div className="min-w-0">
                {title && (
                  <h2 className="mb-2 text-base font-medium leading-snug text-foreground">
                    {title}
                  </h2>
                )}
                <QuoteContent content={quote.content ?? ""} />
              </div>
            </li>
          )
        })}
      </ul>

      <FeedMoreControl
        hasMore={hasMore}
        isLoading={isLoading}
        labels={labels}
        onLoadMore={loadMore}
        sentinelRef={sentinelRef}
        total={total}
      />
    </div>
  )
}

type FeedMoreControlProps = {
  hasMore: boolean
  isLoading: boolean
  labels: HomeQuoteFeedLabels
  onLoadMore: () => void
  sentinelRef: React.RefObject<HTMLDivElement | null>
  total: number
}

function FeedMoreControl({
  hasMore,
  isLoading,
  labels,
  onLoadMore,
  sentinelRef,
  total,
}: FeedMoreControlProps) {
  return (
    <div className="home-feed-more" ref={sentinelRef}>
      {hasMore ? (
        <button
          type="button"
          className="home-feed-more-button"
          disabled={isLoading}
          onClick={onLoadMore}
        >
          {isLoading ? labels.loadingMore : labels.loadMore}
        </button>
      ) : total > 0 ? (
        <span className="home-feed-complete">{labels.allLoaded}</span>
      ) : null}
    </div>
  )
}

function getVisibleTitle(quote: HomeQuoteFeedItem) {
  const title = quote.title.replace(/\s*\|\d+x\d+\s*$/, "").trim()

  if (!title) {
    return null
  }

  if ((quote.content ?? "").trim().startsWith(title)) {
    return null
  }

  return title
}
