import { getTranslations } from "next-intl/server"
import { PhotoForm } from "@/components/admin/PhotoForm"
import { prisma } from "@/lib/prisma"

export default async function NewPhotoPage() {
  const t = await getTranslations("studio")
  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-medium">{t("addPhoto")}</h1>
      </header>
      <PhotoForm allTags={allTags} />
    </div>
  )
}
