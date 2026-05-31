import { getTranslations } from "next-intl/server"
import { getAllPhotos } from "@/lib/queries"
import Link from "next/link"
import Image from "next/image"
import { InlineRemoveForm } from "@/components/admin/InlineRemoveForm"
import { deletePhoto } from "@/app/actions/photos"

export default async function PhotosAdminPage() {
  const t = await getTranslations("studio")
  const photos = await getAllPhotos()

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-serif tracking-tight mb-2">
          {t("gallery")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("galleryDescription")}
        </p>
      </header>

      <div className="mb-8">
        <Link
          href="/admin/photos/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm font-medium"
        >
          + Add Photo
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border/20">
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
              <p className="text-white text-sm font-medium text-center line-clamp-2">
                {photo.title}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/photos/${photo.id}/edit`}
                  className="px-3 py-1 bg-white text-black rounded text-xs hover:bg-white/90"
                >
                  Edit
                </Link>
                <InlineRemoveForm
                  id={photo.id}
                  action={deletePhoto}
                  label="Delete"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No photos yet. Add your first photo to get started.
        </p>
      )}
    </div>
  )
}
