import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { PhotoForm } from "@/components/admin/PhotoForm"
import { getPhotoById } from "@/lib/queries"
import { prisma } from "@/lib/prisma"

export default async function EditPhotoPage({ params }: { params: { id: string } }) {
  const t = await getTranslations("studio")
  const photo = await getPhotoById(params.id)
  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } })

  if (!photo) notFound()

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-serif tracking-tight">Edit Photo</h1>
      </header>
      <PhotoForm photo={photo} allTags={allTags} />
    </div>
  )
}
