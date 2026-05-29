import { getTranslations } from "next-intl/server"
import { getAllCategories } from "@/lib/queries"
import { createCategory, deleteCategory } from "@/app/actions/admin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function AdminCategoriesPage() {
  const t = await getTranslations("admin")
  const categories = await getAllCategories()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("categories")}</h1>

      <form action={createCategory} className="flex gap-2 mb-6">
        <Input name="name" placeholder={t("categoryNamePlaceholder")} required className="max-w-xs" />
        <Button type="submit">{t("add")}</Button>
      </form>

      <div className="border rounded-md max-w-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 text-sm font-medium">{t("name")}</th>
              <th className="text-left px-4 py-3 text-sm font-medium">{t("posts")}</th>
              <th className="text-right px-4 py-3 text-sm font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm">{c.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c._count.posts}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button variant="destructive" size="sm" type="submit">
                      {t("delete")}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
