import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBarChart, RegistrationsTrendChart } from "@/components/analytics/charts"

export const metadata = { title: "My Analytics" }

const STATUS_ORDER = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"] as const

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Pending Approval",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
}

type DailyCount = { day: Date; count: bigint }

export default async function OrganizerAnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/analytics")

  const organizerId = session.user.id

  const [
    totalEvents,
    totalRegistrations,
    totalCheckIns,
    revenue,
    eventsByStatus,
    topEventsByRegistrations,
    registrationsByDay,
  ] = await Promise.all([
    db.event.count({ where: { organizerId } }),
    db.registration.count({
      where: { event: { organizerId }, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
    }),
    db.checkIn.count({ where: { event: { organizerId } } }),
    db.payment.aggregate({
      where: { status: "COMPLETED", registration: { event: { organizerId } } },
      _sum: { amount: true },
    }),
    db.event.groupBy({ by: ["status"], where: { organizerId }, _count: true }),
    db.event.findMany({
      where: { organizerId },
      select: { title: true, _count: { select: { registrations: true } } },
      orderBy: { registrations: { _count: "desc" } },
      take: 6,
    }),
    db.$queryRaw<DailyCount[]>`
      SELECT date_trunc('day', r."registeredAt") AS day, COUNT(*)::bigint AS count
      FROM "Registration" r
      JOIN "Event" e ON e.id = r."eventId"
      WHERE e."organizerId" = ${organizerId}
        AND r."registeredAt" >= NOW() - INTERVAL '14 days'
      GROUP BY day
      ORDER BY day ASC
    `,
  ])

  const eventsByStatusData = STATUS_ORDER.filter((status) =>
    eventsByStatus.some((g) => g.status === status)
  ).map((status) => ({
    label: STATUS_LABELS[status],
    value: eventsByStatus.find((g) => g.status === status)?._count ?? 0,
  }))

  const topEventsData = topEventsByRegistrations
    .filter((e) => e._count.registrations > 0)
    .map((e) => ({ label: e.title, value: e._count.registrations }))

  const registrationsByDayMap = new Map(
    registrationsByDay.map((row) => [row.day.toISOString().slice(0, 10), Number(row.count)])
  )
  const registrationsTrendData = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000)
    const key = date.toISOString().slice(0, 10)
    return {
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: registrationsByDayMap.get(key) ?? 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance across all the events you organize</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{totalEvents}</div>
            <div className="text-xs text-muted-foreground">My Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{totalRegistrations}</div>
            <div className="text-xs text-muted-foreground">Total Registrations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{totalCheckIns}</div>
            <div className="text-xs text-muted-foreground">Total Check-ins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">${(revenue._sum.amount ?? 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations, Last 14 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationsTrendChart data={registrationsTrendData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Events by Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {topEventsData.length > 0 ? (
              <CategoryBarChart data={topEventsData} />
            ) : (
              <p className="text-sm text-muted-foreground">No registrations yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Events by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsByStatusData.length > 0 ? (
              <CategoryBarChart data={eventsByStatusData} />
            ) : (
              <p className="text-sm text-muted-foreground">You haven&apos;t created any events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
