import { escapeRegex } from "@/lib/utils"

export const WIKI_LINK_REGEX = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g

// Matches a wiki-link that targets a specific title or slug, e.g. `[[target]]`
// or `[[target|alias]]` (case-insensitive). Used for backlink detection.
export function buildWikiLinkRegex(target: string): RegExp {
  return new RegExp(`\\[\\[${escapeRegex(target)}(\\|[^\\]]+)?\\]\\]`, "i")
}
