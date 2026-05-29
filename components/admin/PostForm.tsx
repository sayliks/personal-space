"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PostEditor } from "@/components/admin/PostEditor"
import { createPost, updatePost } from "@/app/actions/posts"

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface PostFormProps {
  post?: {
    id: string
    title: string
    content: string | null
    summary: string | null
    coverImage: string | null
    published: boolean
    categoryId: string | null
    tags: { tag: { id: string; name: string } }[]
  }
  categories: Category[]
  tags: Tag[]
}

export function PostForm({ post, categories, tags }: PostFormProps) {
  const t = useTranslations("admin")
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [summary, setSummary] = useState(post?.summary ?? "")
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "")
  const [published, setPublished] = useState(post?.published ?? false)
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags.map((t) => t.tag.id) ?? []
  )
  const [saving, setSaving] = useState(false)

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    if (isEdit) formData.set("id", post!.id)
    formData.set("title", title)
    formData.set("content", content)
    if (summary) formData.set("summary", summary)
    if (coverImage) formData.set("coverImage", coverImage)
    formData.set("published", String(published))
    if (categoryId) formData.set("categoryId", categoryId)
    for (const tagId of selectedTags) {
      formData.append("tags", tagId)
    }

    const result = isEdit ? await updatePost(formData) : await createPost(formData)

    if (result.success) {
      toast.success(isEdit ? t("postUpdated") : t("postCreated"))
      router.push("/admin/posts")
      router.refresh()
    } else {
      toast.error(result.error || t("failedToSave"))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Label htmlFor="title">{t("title")}</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">{t("category")}</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t("none")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>{t("published")}</Label>
          <label className="flex items-center gap-2 h-9 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <span className="text-sm text-muted-foreground">
              {published ? t("published") : t("draft")}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("tags")}</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">{t("summary")}</Label>
        <Input
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={t("summaryPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">{t("coverImage")}</Label>
        <Input
          id="coverImage"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder={t("coverImagePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("contentMarkdown")}</Label>
        <PostEditor value={content} onChange={setContent} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : isEdit ? t("updatePost") : t("createPost")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  )
}
