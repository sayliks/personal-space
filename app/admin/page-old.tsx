import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudioStats } from "@/lib/queries"

export default async function AdminDashboard() {
  const t = await getTranslations("admin")
  const { postCount, categoryCount, tagCount, pendingComments } = await getStudioStats()

  const stats = [
    { label: t("posts"), value: postCount },
    { label: t("categories"), value: categoryCount },
    { label: t("tags"), value: tagCount },
    { label: t("pendingComments"), value: pendingComments },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("dashboard")}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
