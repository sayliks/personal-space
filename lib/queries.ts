import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const POST_INCLUDES = {
  author: { select: { id: true, name: true } },
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof POST_INCLUDES;
}>;

export async function getPublishedPosts(params: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const { page = 1, pageSize = 10, categorySlug, tagSlug } = params;
  const where: Prisma.PostWhereInput = {
    published: true,
    publishedAt: { lte: new Date() },
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: POST_INCLUDES,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: POST_INCLUDES,
  });
}

export async function getAllPosts() {
  return prisma.post.findMany({
    include: POST_INCLUDES,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { ...POST_INCLUDES, comments: true },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getAllTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getCommentsByPostId(postId: string) {
  return prisma.comment.findMany({
    where: { postId, approved: true, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        where: { approved: true },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function searchPosts(q: string) {
  return prisma.post.findMany({
    where: {
      published: true,
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    },
    include: POST_INCLUDES,
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export async function getPendingComments() {
  return prisma.comment.findMany({
    where: { approved: false },
    include: { post: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}
