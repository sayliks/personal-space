"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createPhoto, updatePhoto } from "@/app/actions/photos"
import type { Photo, Tag } from "@/app/generated/prisma/client"

interface PhotoFormProps {
  photo?: Photo & { tags: Array<{ tag: Tag }> }
  allTags: Tag[]
}

export function PhotoForm({ photo, allTags }: PhotoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    photo?.tags.map(pt => pt.tag.id) ?? []
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("tags", JSON.stringify(selectedTags))

    const result = photo
      ? await updatePhoto(photo.id, formData)
      : await createPhoto(formData)

    if (result.success) {
      toast.success(photo ? "Photo updated" : "Photo created")
      router.push("/admin/photos")
      router.refresh()
    } else {
      toast.error(result.error.issues[0].message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={photo?.title}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <input
          type="url"
          name="imageUrl"
          defaultValue={photo?.imageUrl}
          required
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description (optional)</label>
        <textarea
          name="description"
          defaultValue={photo?.description ?? ""}
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm font-medium mb-2">Display Order</label>
        <input
          type="number"
          name="order"
          defaultValue={photo?.order ?? 0}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
        <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag.id)
                    ? prev.filter(id => id !== tag.id)
                    : [...prev, tag.id]
                )
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag.id)
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Published */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={photo?.published ?? true}
          value="true"
          className="rounded"
        />
        <label htmlFor="published" className="text-sm">Published</label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? "Saving..." : photo ? "Update Photo" : "Create Photo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
