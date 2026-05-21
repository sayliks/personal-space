import { slug } from "github-slugger";

export function generateSlug(text: string): string {
  return slug(text);
}
