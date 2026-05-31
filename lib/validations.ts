import { z } from "zod";

export const COMMENT_MAX_LENGTH = 2000;
export const QUOTE_MAX_LENGTH = 500;

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().nullish(),
  summary: z.string().max(500).nullish().or(z.literal("")),
  coverImage: z.string().url().nullish().or(z.literal("")),
  categoryId: z.string().nullish(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
});

export const createQuoteSchema = z.object({
  content: z.string().trim().min(1).max(QUOTE_MAX_LENGTH),
  published: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(COMMENT_MAX_LENGTH),
  authorName: z.string().min(1).max(50),
  authorEmail: z.string().email().optional().or(z.literal("")),
  postId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

export const createPhotoSchema = z.object({
  title: z.string().min(1).max(200),
  imageUrl: z.string().min(1).transform((val) => {
    // Extract URL from Markdown: ![alt](url)
    const markdownMatch = val.match(/!\[.*?\]\((.*?)\)/);
    if (markdownMatch) return markdownMatch[1];

    // Extract URL from HTML: <img src="url" />
    const htmlMatch = val.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlMatch) return htmlMatch[1];

    // Return as-is if it's already a plain URL
    return val;
  }).pipe(z.string().url()),
  description: z.string().max(500).nullish().or(z.literal("")),
  order: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
});
