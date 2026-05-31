import { getTranslations } from "next-intl/server"
import { PhotoForm } from "@/components/admin/PhotoForm"
import { prisma } from "@/lib/prisma"

export default async function NewPhotoPage() {
  const t = await getTranslations("studio")
  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } })

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-serif tracking-tight">Add Photo</h1>
      </header>
      <PhotoForm allTags={allTags} />
    </div>
  )
}
