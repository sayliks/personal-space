export const WIKI_LINK_REGEX = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g

export function extractWikiLinks(content: string): string[] {
  const links = new Set<string>()
  let match: RegExpExecArray | null
  // Reset lastIndex since the regex is a module-level constant with the `g` flag
  WIKI_LINK_REGEX.lastIndex = 0
  while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
    const target = match[1].trim()
    if (target) links.add(target)
  }
  return [...links]
}
