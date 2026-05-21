import { PostForm } from "@/components/admin/PostForm"
import { getAllCategories, getAllTags } from "@/lib/queries"

export default async function NewPostPage() {
  const categories = await getAllCategories()
  const tags = await getAllTags()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Post</h1>
      <PostForm categories={categories} tags={tags} />
    </div>
  )
}
