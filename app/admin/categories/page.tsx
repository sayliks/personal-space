import { getTranslations } from "next-intl/server"
import { getAllCategories } from "@/lib/queries"
import { createCategory, deleteCategory } from "@/app/actions/admin"
import { InlineAddForm } from "@/components/admin/InlineAddForm"
import { InlineRemoveForm } from "@/components/admin/InlineRemoveForm"

export default async function StudioPathsPage() {
  const t = await getTranslations("studio")
  const categories = await getAllCategories()

  return (
    <div className="space-y-16">
      {/* Header */}
      <header>
        <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight leading-tight">
          {t("categoriesTitle")}
        </h1>
        <p className="text-muted-foreground/70 leading-relaxed max-w-xl">
          {t("categoriesSubtitle")}
        </p>
      </header>

      {/* Add form */}
      <section>
        <InlineAddForm
          action={createCategory}
          placeholder={t("pathPlaceholder")}
          label={t("addPath")}
        />
      </section>

      {/* List */}
      <section className="pt-8 border-t border-border/20">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 italic">
            {t("noPaths")}
          </p>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex items-baseline justify-between gap-6"
              >
                <div className="flex items-baseline gap-4 min-w-0">
                  <h3 className="text-lg font-serif tracking-tight truncate group-hover:text-muted-foreground transition-colors duration-300">
                    {category.title}
                  </h3>
                  <span className="shrink-0 text-xs text-muted-foreground/40 font-mono">
                    {t("countWritings", { count: category._count.documents })}
                  </span>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <InlineRemoveForm action={deleteCategory} id={category.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
