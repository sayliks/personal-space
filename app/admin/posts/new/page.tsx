import { getTranslations } from "next-intl/server"
import { PostForm } from "@/components/admin/PostForm"
import { getAllCategories, getAllTags } from "@/lib/queries"

export default async function NewPostPage() {
  const t = await getTranslations("admin")
  const categories = await getAllCategories()
  const tags = await getAllTags()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium">{t("newPost")}</h1>
      <PostForm categories={categories} tags={tags} />
    </div>
  )
}
