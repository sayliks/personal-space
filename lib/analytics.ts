import { prisma } from "@/lib/prisma"

export async function getAnalyticsStats(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalViews, uniqueVisitors, recentVisits] = await Promise.all([
    // Total page views
    prisma.pageView.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Unique visitors (by IP)
    prisma.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { ip: true },
      distinct: ["ip"],
    }).then((results) => results.length),

    // Recent visits aggregated by IP
    prisma.pageView.groupBy({
      by: ["ip"],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      orderBy: [
        { _count: { id: "desc" } },
        { ip: "asc" },
      ],
      take: 50,
    }).then((results) =>
      results.map((result) => ({
        ip: result.ip,
        count: result._count.id,
      }))
    ),
  ])

  return {
    totalViews,
    uniqueVisitors,
    recentVisits,
  }
}

export async function getVisitorsByDay(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  })

  // Group by day
  const viewsByDay: Record<string, number> = {}
  views.forEach((view) => {
    const day = view.createdAt.toISOString().split("T")[0]
    viewsByDay[day] = (viewsByDay[day] || 0) + 1
  })

  return Object.entries(viewsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
