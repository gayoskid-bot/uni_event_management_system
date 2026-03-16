import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Platform Analytics" }

export default async function AdminAnalyticsPage() {
  const [
    totalUsers,
    totalEvents,
    totalRegistrations,
    usersByRole,
    eventsByStatus,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.registration.count(),
    db.user.groupBy({ by: ["role"], _count: true }),
    db.event.groupBy({ by: ["status"], _count: true }),
    db.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ])

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersByRole.map((group) => (
                <div key={group.role} className="flex items-center justify-between">
                  <span className="text-sm">{group.role}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(group._count / totalUsers) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{group._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventsByStatus.map((group) => (
                <div key={group.status} className="flex items-center justify-between">
                  <span className="text-sm">{group.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${totalEvents > 0 ? (group._count / totalEvents) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{group._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
