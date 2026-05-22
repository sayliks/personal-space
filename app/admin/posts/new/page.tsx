import { getTranslations } from "next-intl/server"
import { PostForm } from "@/components/admin/PostForm"
import { getAllCategories, getAllTags } from "@/lib/queries"

export default async function NewPostPage() {
  const t = await getTranslations("admin")
  const categories = await getAllCategories()
  const tags = await getAllTags()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("newPost")}</h1>
      <PostForm categories={categories} tags={tags} />
    </div>
  )
}
