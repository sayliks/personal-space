import { slug } from "github-slugger";

export function generateSlug(text: string): string {
  const result = slug(text);
  if (!result) {
    return `post-${Date.now().toString(36)}`;
  }
  return result;
}
