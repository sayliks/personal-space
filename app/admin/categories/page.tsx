import { getTranslations } from "next-intl/server"
import { getAllCategories } from "@/lib/queries"
import { createCategory, deleteCategory } from "@/app/actions/admin"
import { InlineAddForm } from "@/components/admin/InlineAddForm"
import { InlineRemoveForm } from "@/components/admin/InlineRemoveForm"

export default async function StudioPathsPage() {
  const t = await getTranslations("studio")
  const categories = await getAllCategories()

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-medium mb-2">
          {t("categoriesTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
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
      <section className="pt-6 border-t border-border/40">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noPaths")}
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex items-baseline justify-between gap-6"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <h3 className="text-sm font-medium truncate group-hover:text-muted-foreground transition-colors">
                    {category.title}
                  </h3>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {t("countWritings", { count: category._count.documents })}
                  </span>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
