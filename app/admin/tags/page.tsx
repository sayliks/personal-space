import { getTranslations } from "next-intl/server"
import { getAllTags } from "@/lib/queries"
import { createTag, deleteTag } from "@/app/actions/admin"
import { InlineAddForm } from "@/components/admin/InlineAddForm"
import { InlineRemoveForm } from "@/components/admin/InlineRemoveForm"

export default async function StudioConnectionsPage() {
  const t = await getTranslations("studio")
  const tags = await getAllTags()

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-medium mb-2">
          {t("tagsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("tagsSubtitle")}
        </p>
      </header>

      {/* Add form */}
      <section>
        <InlineAddForm
          action={createTag}
          placeholder={t("connectionPlaceholder")}
          label={t("addConnection")}
        />
      </section>

      {/* List */}
      <section className="pt-6 border-t border-border/40">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noConnections")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-baseline gap-2"
              >
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  #{tag.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tag._count.documents}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <InlineRemoveForm action={deleteTag} id={tag.id} />
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
