/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

type QuoteContentProps = {
  content: string
  compact?: boolean
  className?: string
}

export function QuoteContent({ content, compact = false, className }: QuoteContentProps) {
  return (
    <div className={cn("quote-markdown", compact && "quote-markdown-compact", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") return null

            return (
              <span className="quote-markdown-image">
                <img
                  src={src}
                  alt={alt ?? ""}
                  loading="lazy"
                />
              </span>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
