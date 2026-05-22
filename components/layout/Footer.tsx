import { getTranslations } from "next-intl/server"

export async function Footer() {
  const t = await getTranslations("footer")

  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto flex items-center justify-center h-14 px-4 text-sm text-muted-foreground">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  )
}
