import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { PhotoForm } from "@/components/admin/PhotoForm"
import { getPhotoById } from "@/lib/queries"
import { prisma } from "@/lib/prisma"

export default async function EditPhotoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const t = await getTranslations("studio")
  const photo = await getPhotoById(params.id)
  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } })

  if (!photo) notFound()

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-medium">{t("editPhoto")}</h1>
      </header>
      <PhotoForm photo={photo} allTags={allTags} />
    </div>
  )
}
