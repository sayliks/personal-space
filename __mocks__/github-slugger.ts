export function slug(text: string): string {
  if (!text.trim()) return ""
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "")
}
