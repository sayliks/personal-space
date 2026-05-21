import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug 只能包含小写字母、数字和连字符"),
  content: z.string().optional(),
  summary: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).default([]),
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
