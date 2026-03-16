import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, ClipboardCheck, Flag, UserCheck, Eye } from "lucide-react"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalEvents,
    totalRegistrations,
    pendingApplications,
    pendingReports,
    activeOrganizers,
  ] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.registration.count(),
    db.organizerApplication.count({ where: { status: "PENDING" } }),
    db.report.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { role: "ORGANIZER" } }),
  ])

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Total Events", value: totalEvents, icon: CalendarDays, color: "text-green-600" },
    { label: "Registrations", value: totalRegistrations, icon: UserCheck, color: "text-purple-600" },
    { label: "Active Organizers", value: activeOrganizers, icon: Users, color: "text-indigo-600" },
    { label: "Pending Applications", value: pendingApplications, icon: ClipboardCheck, color: "text-yellow-600" },
    { label: "Pending Reports", value: pendingReports, icon: Flag, color: "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
