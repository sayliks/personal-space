import { getTranslations } from "next-intl/server"
import { getAllTags } from "@/lib/queries"
import { createTag, deleteTag } from "@/app/actions/admin"
import { InlineAddForm } from "@/components/admin/InlineAddForm"
import { InlineRemoveForm } from "@/components/admin/InlineRemoveForm"

export default async function StudioConnectionsPage() {
  const t = await getTranslations("studio")
  const tags = await getAllTags()

  return (
    <div className="space-y-16">
      {/* Header */}
      <header>
        <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight leading-tight">
          {t("tagsTitle")}
        </h1>
        <p className="text-muted-foreground/70 leading-relaxed max-w-xl">
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

      {/* List — connections flow as a woven field of tags */}
      <section className="pt-8 border-t border-border/20">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 italic">
            {t("noConnections")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-baseline gap-3"
              >
                <span className="text-base font-mono text-muted-foreground/70 group-hover:text-foreground transition-colors duration-300">
                  #{tag.name}
                </span>
                <span className="text-xs text-muted-foreground/40 font-mono">
                  {tag._count.documents}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
