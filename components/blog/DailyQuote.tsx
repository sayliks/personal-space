"use client"

import { useEffect, useState } from "react"

interface HitokotoQuote {
  id: number
  uuid: string
  hitokoto: string
  type: string
  from: string
  from_who: string | null
  creator: string
  creator_uid: number
  reviewer: number
  commit_from: string
  created_at: string
  length: number
}

const CATEGORIES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

export function DailyQuote() {
  const [quote, setQuote] = useState<HitokotoQuote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Randomly select a category
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
        const response = await fetch(`https://v1.hitokoto.cn/?c=${category}`)
        const data = await response.json()
        setQuote(data)
      } catch (error) {
        console.error('Failed to fetch quote:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [])

  if (loading) {
    return (
      <div className="py-8 px-6 border border-border/40 rounded-lg bg-muted/20">
        <div className="h-16 flex items-center justify-center">
          <p className="text-sm text-muted-foreground/50">Loading...</p>
        </div>
      </div>
    )
  }

  if (!quote) return null

  return (
    <div className="py-8 px-6 border border-border/40 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <blockquote className="space-y-3">
        <p className="text-base leading-relaxed text-foreground/85 font-serif italic">
          "{quote.hitokoto}"
        </p>
        <footer className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>—</span>
          <cite className="not-italic">
            {quote.from_who && <span>{quote.from_who}, </span>}
            <span className="font-medium">{quote.from}</span>
          </cite>
        </footer>
      </blockquote>
    </div>
  )
}
