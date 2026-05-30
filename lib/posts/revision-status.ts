// A post is "revisited" when it was meaningfully edited after first publish.
// `publishedAt` is frozen at publish; `updatedAt` bumps on every save, so a gap
// beyond this threshold means the post was returned to later.
export const POST_REVISIT_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 1 day

export function isPostRevisited(post: {
  publishedAt: Date | null;
  updatedAt: Date;
}): boolean {
  if (!post.publishedAt) return false;

  return post.updatedAt.getTime() - post.publishedAt.getTime() > POST_REVISIT_THRESHOLD_MS;
}
