import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryBarChart, RegistrationsTrendChart } from "@/components/admin/analytics-charts"

export const metadata = { title: "Platform Analytics" }

const ROLE_ORDER = ["STUDENT", "ORGANIZER", "ADMIN"] as const
const STATUS_ORDER = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"] as const

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  ORGANIZER: "Organizer",
  ADMIN: "Admin",
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
}

type DailyCount = { day: Date; count: bigint }

export default async function AdminAnalyticsPage() {
  const [
    totalUsers,
    totalEvents,
    totalRegistrations,
    usersByRole,
    eventsByStatus,
    recentUsers,
    registrationsByDay,
  ] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.registration.count(),
    db.user.groupBy({ by: ["role"], _count: true }),
    db.event.groupBy({ by: ["status"], _count: true }),
    db.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    db.$queryRaw<DailyCount[]>`
      SELECT date_trunc('day', "registeredAt") AS day, COUNT(*)::bigint AS count
      FROM "Registration"
      WHERE "registeredAt" >= NOW() - INTERVAL '14 days'
      GROUP BY day
      ORDER BY day ASC
    `,
  ])

  const usersByRoleData = ROLE_ORDER.filter((role) => usersByRole.some((g) => g.role === role)).map(
    (role) => ({
      label: ROLE_LABELS[role],
      value: usersByRole.find((g) => g.role === role)?._count ?? 0,
    })
  )

  const eventsByStatusData = STATUS_ORDER.filter((status) =>
    eventsByStatus.some((g) => g.status === status)
  ).map((status) => ({
    label: STATUS_LABELS[status],
    value: eventsByStatus.find((g) => g.status === status)?._count ?? 0,
  }))

  // Fill in every day of the last 14 days, even ones with zero registrations,
  // so the trend line doesn't silently skip gaps.
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
      <h1 className="text-3xl font-bold">Platform Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{totalEvents}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
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
            <div className="text-3xl font-bold">{recentUsers}</div>
            <div className="text-xs text-muted-foreground">New Users (30d)</div>
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
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {usersByRoleData.length > 0 ? (
              <CategoryBarChart data={usersByRoleData} />
            ) : (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsByStatusData.length > 0 ? (
              <CategoryBarChart data={eventsByStatusData} />
            ) : (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
