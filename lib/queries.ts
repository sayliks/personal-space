import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const DOCUMENT_INCLUDES = {
  author: { select: { id: true, name: true } },
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.DocumentInclude;

export type PostWithRelations = Prisma.DocumentGetPayload<{
  include: typeof DOCUMENT_INCLUDES;
}>;

function isTransientPrismaError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Connection terminated unexpectedly") ||
      error.message.includes("Operation has timed out") ||
      error.message.includes("P1001"))
  );
}

async function withTransientRetry<T>(label: string, query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (!isTransientPrismaError(error)) throw error;

    if (process.env.NODE_ENV !== "production") {
      console.warn(`Queries: ${label} retrying after transient Prisma error`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return query();
  }
}

export async function getHomePosts(limit = 14) {
  return prisma.document.findMany({
    where: {
      type: "POST",
      published: true,
      publishedAt: { lte: new Date() },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { title: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getPublishedPosts(params: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const { page = 1, pageSize = 10, categorySlug, tagSlug } = params;
  const where: Prisma.DocumentWhereInput = {
    type: "POST",
    published: true,
    publishedAt: { lte: new Date() },
  };

  if (categorySlug) {
    where.category = { slug: categorySlug, type: "CATEGORY" };
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  const posts = await withTransientRetry("published posts list", () =>
    prisma.document.findMany({
      where,
      include: DOCUMENT_INCLUDES,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ).catch((error) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Queries: published posts list fell back after failure", error);
    }
    return [];
  });

  const total = await withTransientRetry("published posts count", () => prisma.document.count({ where }))
    .catch((error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Queries: published posts count fell back after failure", error);
      }
      return posts.length;
    });

  return { posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPostBySlug(slug: string) {
  return prisma.document.findUnique({
    where: { slug, type: "POST" },
    include: DOCUMENT_INCLUDES,
  });
}

export async function getAllPosts() {
  return prisma.document.findMany({
    where: { type: "POST" },
    include: DOCUMENT_INCLUDES,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostById(id: string) {
  return prisma.document.findUnique({
    where: { id, type: "POST" },
    include: { ...DOCUMENT_INCLUDES, comments: true },
  });
}

export async function getAllCategories() {
  return prisma.document.findMany({
    where: { type: "CATEGORY" },
    include: { _count: { select: { documents: true } } },
    orderBy: { title: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.document.findFirst({
    where: { slug, type: "CATEGORY" },
  });
}

export async function getAllTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { documents: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getCommentsByPostId(postId: string) {
  return prisma.comment.findMany({
    where: { documentId: postId, approved: true, parentId: null },
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
  return prisma.document.findMany({
    where: {
      type: "POST",
      published: true,
      publishedAt: { lte: new Date() },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ],
    },
    include: DOCUMENT_INCLUDES,
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export async function getBacklinkCandidates(params: {
  postId: string
  title: string
  slug: string
}) {
  return prisma.document.findMany({
    where: {
      type: "POST",
      published: true,
      id: { not: params.postId },
      OR: [
        { content: { contains: params.title, mode: "insensitive" } },
        { content: { contains: `[[${params.slug}]]`, mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, slug: true, summary: true, content: true },
  })
}

export async function getPendingComments() {
  return prisma.comment.findMany({
    where: { approved: false },
    include: { document: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudioStats() {
  const [postCount, categoryCount, tagCount, pendingComments] = await Promise.all([
    prisma.document.count({ where: { type: "POST" } }),
    prisma.document.count({ where: { type: "CATEGORY" } }),
    prisma.tag.count(),
    prisma.comment.count({ where: { approved: false } }),
  ]);
  return { postCount, categoryCount, tagCount, pendingComments };
}

export async function getRecentPosts(limit = 5) {
  return prisma.document.findMany({
    where: { type: "POST" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true, title: true, published: true, updatedAt: true },
  });
}

export async function getRelatedPosts(params: {
  postId: string;
  tagIds?: string[];
  categoryId?: string | null;
  limit?: number;
}) {
  const { postId, tagIds = [], categoryId, limit = 3 } = params;

  return prisma.document.findMany({
    where: {
      type: "POST",
      published: true,
      id: { not: postId },
      OR: [
        ...(tagIds.length
          ? [
              {
                tags: {
                  some: {
                    tagId: { in: tagIds },
                  },
                },
              },
            ]
          : []),
        ...(categoryId
          ? [
              {
                categoryId,
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      tags: { include: { tag: true } },
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);
}

export async function getSitemapEntries() {
  const [posts, categories, tags] = await Promise.all([
    prisma.document.findMany({
      where: { type: "POST", published: true, publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.document.findMany({ where: { type: "CATEGORY" }, select: { slug: true, updatedAt: true } }),
    prisma.tag.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return { posts, categories, tags };
}

export async function getGraphPosts() {
  return prisma.document.findMany({
    where: { type: "POST", published: true, publishedAt: { lte: new Date() } },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      category: { select: { title: true } },
    },
  });
}
