import { getTranslations } from "next-intl/server"

export default async function Loading() {
  const t = await getTranslations("common")
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    </div>
  );
}
