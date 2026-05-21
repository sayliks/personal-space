import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  summary: z.string().max(500).optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
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
