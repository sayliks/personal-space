import { getTranslations } from "next-intl/server"
import { getPostById, getAllCategories, getAllTags } from "@/lib/queries"
import { notFound } from "next/navigation"
import { PostForm } from "@/components/admin/PostForm"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("admin")
  const { id } = await params
  const [post, categories, tags] = await Promise.all([
    getPostById(id),
    getAllCategories(),
    getAllTags(),
  ])

  if (!post) notFound()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium">{t("editPost")}</h1>
      <PostForm
        post={{
          id: post.id,
          title: post.title,
          content: post.content,
          summary: post.summary,
          coverImage: post.coverImage,
          published: post.published,
          categoryId: post.categoryId,
          tags: post.tags.map((pt) => ({ tag: pt.tag })),
        }}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}
