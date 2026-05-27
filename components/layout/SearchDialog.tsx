"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SearchResult {
  id: string
  title: string
  slug: string
  summary: string | null
  publishedAt: string | null
}

export function SearchDialog() {
  const t = useTranslations("search")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when dialog opens
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) return

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery("")
      setResults([])
    }
  }, [])

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false)
      router.push(`/posts/${slug}`)
    },
    [router]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && results.length > 0) {
        handleSelect(results[0].slug)
      }
    },
    [results, handleSelect]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="ml-1.5">{t("title")}</span>
      </Button>

      <DialogContent className="sm:max-w-lg bg-popover/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {query.trim() && (
          <div className="min-h-[100px] max-h-[320px] overflow-y-auto">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t("loading")}
              </p>
            ) : results.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t("noResults")}
              </p>
            ) : (
              <ul className="space-y-1">
                {results.map((post) => (
                  <li key={post.id}>
                    <button
                      onClick={() => handleSelect(post.slug)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium">{post.title}</span>
                      {post.summary && (
                        <span className="block text-xs text-muted-foreground truncate mt-0.5">
                          {post.summary}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center">
          {t("hint")}
        </p>
      </DialogContent>
    </Dialog>
  )
}
