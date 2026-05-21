export function getExcerpt(markdown: string, maxLength = 200): string {
  const text = markdown.replace(/^#{1,6}\s.*$/gm, "").trim();
  const plain = text.replace(/[*_~`>\[\]()#!|]/g, "").replace(/\s+/g, " ").trim();
  return plain.length > maxLength ? plain.slice(0, maxLength) + "..." : plain;
}

export function stripMarkdown(markdown: string): string {
  let text = markdown;
  text = text.replace(/^#{1,6}\s.*$/gm, "");
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");
  text = text.replace(/\[([^\]]*?)\]\(.*?\)/g, "$1");
  text = text.replace(/[*_~`>]/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}
