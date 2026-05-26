import { visit } from "unist-util-visit"
import type { Plugin } from "unified"
import type { Root, Text, Link } from "mdast"
import { generateSlug } from "@/lib/slug"
import { WIKI_LINK_REGEX } from "@/lib/wiki-link"

export const remarkWikiLink: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || typeof index !== "number") return

      const value = node.value
      const parts: (Text | Link)[] = []
      let lastIndex = 0

      for (const match of value.matchAll(WIKI_LINK_REGEX)) {
        const start = match.index
        if (start > lastIndex) {
          parts.push({ type: "text", value: value.slice(lastIndex, start) })
        }

        const target = match[1].trim()
        const alias = match[2]?.trim() ?? target
        const slug = generateSlug(target)

        parts.push({
          type: "link",
          url: `/posts/${slug}`,
          children: [{ type: "text", value: alias }],
          data: {
            hProperties: { className: "wiki-link" },
          },
        })

        lastIndex = start + match[0].length
      }

      if (lastIndex < value.length) {
        parts.push({ type: "text", value: value.slice(lastIndex) })
      }

      if (parts.length > 1) {
        parent.children.splice(index, 1, ...parts)
      }
    })
  }
}
