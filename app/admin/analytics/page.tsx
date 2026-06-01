import { getTranslations } from "next-intl/server"
import { getAnalyticsStats, getVisitorsByDay } from "@/lib/analytics"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const t = await getTranslations("admin")
  const stats = await getAnalyticsStats(7)
  const dailyViews = await getVisitorsByDay(7)
  const maxDailyViews = Math.max(1, ...dailyViews.map((day) => day.count))

  return (
    <div className="relative isolate space-y-6">
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72 rounded-lg bg-[linear-gradient(118deg,oklch(0.72_0.12_205_/_18%),transparent_30%,oklch(0.78_0.12_142_/_12%)_58%,transparent_82%)] blur-2xl dark:bg-[linear-gradient(118deg,oklch(0.6_0.14_214_/_18%),transparent_30%,oklch(0.66_0.16_154_/_12%)_58%,transparent_82%)]" />

      <header className="overflow-hidden rounded-lg border border-white/55 bg-white/45 px-6 py-5 shadow-[0_20px_70px_oklch(0.42_0.03_250_/_10%)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_90px_oklch(0_0_0_/_36%)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              {t("last7Days")}
            </p>
            <h1 className="text-2xl font-medium tracking-tight">
              {t("analytics")}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-72">
            <div className="rounded-md border border-white/55 bg-white/40 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
              <div className="text-xs text-muted-foreground">{t("totalViews")}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{stats.totalViews}</div>
            </div>
            <div className="rounded-md border border-white/55 bg-white/40 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
              <div className="text-xs text-muted-foreground">{t("uniqueVisitors")}</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">{stats.uniqueVisitors}</div>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-white/55 bg-white/42 p-5 shadow-[0_18px_60px_oklch(0.42_0.03_250_/_8%)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_70px_oklch(0_0_0_/_30%)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight">{t("dailyViews")}</h2>
          <span className="rounded-md border border-white/50 bg-white/35 px-2.5 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
            {t("last7Days")}
          </span>
        </div>
        <div className="space-y-3">
          {dailyViews.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 font-mono text-xs text-muted-foreground/80">{day.date}</div>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md border border-white/45 bg-white/32 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
                <div
                  className="h-full rounded-md bg-[linear-gradient(90deg,oklch(0.62_0.12_210_/_78%),oklch(0.7_0.13_152_/_82%))] shadow-[0_0_28px_oklch(0.68_0.13_185_/_24%)] transition-all dark:bg-[linear-gradient(90deg,oklch(0.7_0.12_215_/_74%),oklch(0.76_0.13_155_/_78%))]"
                  style={{
                    width: `${Math.min(100, (day.count / maxDailyViews) * 100)}%`,
                  }}
                />
              </div>
              <div className="w-12 text-right text-sm font-medium tabular-nums">{day.count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-white/55 bg-white/42 shadow-[0_18px_60px_oklch(0.42_0.03_250_/_8%)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_70px_oklch(0_0_0_/_30%)]">
        <div className="border-b border-white/45 bg-white/25 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
          <h2 className="text-lg font-medium tracking-tight">{t("recentVisits")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/45 bg-white/20 dark:border-white/10 dark:bg-white/[0.025]">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("ip")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("times")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVisits.map((visit) => (
                <tr key={visit.ip ?? "unknown"} className="border-b border-white/35 transition-colors last:border-0 hover:bg-white/28 dark:border-white/10 dark:hover:bg-white/[0.045]">
                  <td className="px-4 py-3 text-sm font-mono">
                    {visit.ip || "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums">
                    <span className="inline-flex min-w-12 justify-center rounded-md border border-white/45 bg-white/30 px-2.5 py-1 dark:border-white/10 dark:bg-white/[0.035]">
                      {visit.count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
