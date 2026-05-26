import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import { remarkWikiLink } from "@/lib/remark-wiki-link"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkWikiLink, remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
