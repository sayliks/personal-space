import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getAllQuotes } from "@/lib/queries"
import { QuoteContent } from "@/components/blog/QuoteContent"
import { DeleteQuoteButton } from "./DeleteQuoteButton"

function quoteDate(d: Date | null) {
  return (d ?? new Date())
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".")
}

export default async function StudioQuotesPage() {
  const t = await getTranslations("studio")
  const quotes = await getAllQuotes()

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="mb-2 text-2xl font-medium">{t("quotesTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("quotesSubtitle")}</p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="inline-flex shrink-0 items-center gap-2 rounded bg-muted px-4 py-2 text-sm transition-colors hover:bg-muted/80"
        >
          <span>+</span>
          <span>{t("newQuote")}</span>
        </Link>
      </header>

      <section className="border-t border-border/40 pt-6">
        {quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noQuotes")}</p>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <article key={quote.id} className="group flex items-baseline gap-4">
                <time className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
                  {quoteDate(quote.publishedAt ?? quote.createdAt)}
                </time>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <Link
                      href={`/admin/quotes/${quote.id}/edit`}
                      className="block transition-colors group-hover:text-muted-foreground"
                    >
                      <QuoteContent content={quote.content || t("untitled")} compact />
                    </Link>
                    <span
                      className={`shrink-0 text-xs ${
                        quote.published ? "text-muted-foreground/50" : "text-primary/60"
                      }`}
                    >
                      {quote.published ? t("published") : t("draft")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/admin/quotes/${quote.id}/edit`}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t("edit")}
                    </Link>
                    <DeleteQuoteButton quoteId={quote.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
