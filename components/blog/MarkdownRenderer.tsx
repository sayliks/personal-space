import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import rehypeRaw from "rehype-raw"
import { remarkWikiLink } from "@/lib/remark-wiki-link"

interface MarkdownRendererProps {
  content: string
}

const CENTRAL_QUESTION =
  "Do movies really influence human life, or do we just see ourselves in them?"

function normalizeCentralQuestion(text: string): string {
  return text.trim().replace(/^[“"]/, "").replace(/[”"]$/, "")
}

type RehypeNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: RehypeNode[]
}

function nodeText(node: RehypeNode): string {
  if (node.type === "text") return node.value ?? ""
  return node.children?.map(nodeText).join("") ?? ""
}

function trimTextNode(node: RehypeNode, edge: "start" | "end"): RehypeNode {
  if (node.type !== "text") return node
  return {
    ...node,
    value: edge === "start" ? node.value?.trimStart() : node.value?.trimEnd(),
  }
}

function cleanLeadingQuestionTail(node: RehypeNode): RehypeNode {
  if (node.type !== "text") return node
  return {
    ...node,
    value: node.value?.replace(/^\s*[—-]+\s*/, ""),
  }
}

function hasContent(nodes: RehypeNode[]): boolean {
  return nodes.some((node) => nodeText(node).trim().length > 0)
}

function paragraph(children: RehypeNode[]): RehypeNode {
  return {
    type: "element",
    tagName: "p",
    properties: {},
    children,
  }
}

function pullQuote(): RehypeNode {
  return {
    type: "element",
    tagName: "blockquote",
    properties: { className: ["pull-quote"] },
    children: [paragraph([{ type: "text", value: CENTRAL_QUESTION }])],
  }
}

function promoteCentralQuestion() {
  return function transformer(tree: RehypeNode) {
    function visit(node: RehypeNode) {
      if (!node.children) return

      for (let index = 0; index < node.children.length; index++) {
        const child = node.children[index]

        if (child.tagName === "p" && child.children) {
          const questionIndex = child.children.findIndex(
            (item) =>
              item.tagName === "strong" &&
              normalizeCentralQuestion(nodeText(item)) === CENTRAL_QUESTION
          )

          if (questionIndex !== -1) {
            const before = child.children.slice(0, questionIndex)
            const after = child.children.slice(questionIndex + 1)
            const replacement: RehypeNode[] = []

            if (hasContent(before)) {
              replacement.push(paragraph(before.map((item, i) =>
                i === before.length - 1 ? trimTextNode(item, "end") : item
              )))
            }

            replacement.push(pullQuote())

            if (hasContent(after)) {
              replacement.push(paragraph(after.map((item, i) =>
                i === 0 ? cleanLeadingQuestionTail(trimTextNode(item, "start")) : item
              )))
            }

            node.children.splice(index, 1, ...replacement)
            index += replacement.length - 1
            continue
          }
        }

        visit(child)
      }
    }

    visit(tree)
  }
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert article-prose max-w-none">
      <ReactMarkdown
        // remark-math must run before remark-rehype so $...$ / $$...$$ become
        // math nodes; wiki-link/gfm only touch text and don't conflict.
        remarkPlugins={[remarkMath, remarkWikiLink, remarkGfm]}
        // Order matters: rehype-raw reparses embedded HTML first, then
        // rehype-katex turns math nodes into rendered KaTeX, then highlight
        // (so KaTeX output isn't treated as code) and slug last.
        rehypePlugins={[rehypeRaw, promoteCentralQuestion, rehypeKatex, rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
