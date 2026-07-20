import { db } from "@/server/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  CalendarDays,
  UserCheck,
  ClipboardCheck,
  Flag,
  TrendingUp,
  ArrowRight,
  Eye,
  BarChart3,
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalEvents,
    totalRegistrations,
    pendingEvents,
    pendingApplications,
    pendingReports,
    activeOrganizers,
    recentUsers,
    recentEvents,
    topEvents,
    newUsersThisWeek,
    newEventsThisWeek,
    registrationsThisWeek,
  ] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.registration.count(),
    db.event.count({ where: { status: "DRAFT" } }),
    db.organizerApplication.count({ where: { status: "PENDING" } }),
    db.report.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { role: "ORGANIZER" } }),
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.event.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        startDate: true,
        organizer: { select: { name: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.event.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        _count: { select: { registrations: true, likes: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
    db.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    db.event.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    db.registration.count({
      where: { registeredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ])

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      change: `+${newUsersThisWeek} this week`,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
      href: "/admin/users",
    },
    {
      label: "Total Events",
      value: totalEvents,
      change: `+${newEventsThisWeek} this week`,
      icon: CalendarDays,
      color: "text-green-600 bg-green-50",
      href: "/admin/events",
    },
    {
      label: "Registrations",
      value: totalRegistrations,
      change: `+${registrationsThisWeek} this week`,
      icon: UserCheck,
      color: "text-purple-600 bg-purple-50",
      href: "/admin/analytics",
    },
    {
      label: "Active Organizers",
      value: activeOrganizers,
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-50",
      href: "/admin/users",
    },
    {
      label: "Events Awaiting Approval",
      value: pendingEvents,
      icon: CalendarDays,
      color: pendingEvents > 0
        ? "text-yellow-600 bg-yellow-50"
        : "text-gray-600 bg-gray-50",
      href: "/admin/events?tab=pending",
      urgent: pendingEvents > 0,
    },
    {
      label: "Pending Applications",
      value: pendingApplications,
      icon: ClipboardCheck,
      color: pendingApplications > 0
        ? "text-yellow-600 bg-yellow-50"
        : "text-gray-600 bg-gray-50",
      href: "/admin/applications",
      urgent: pendingApplications > 0,
    },
    {
      label: "Pending Reports",
      value: pendingReports,
      icon: Flag,
      color: pendingReports > 0
        ? "text-red-600 bg-red-50"
        : "text-gray-600 bg-gray-50",
      href: "/admin/reports",
      urgent: pendingReports > 0,
    },
  ]

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  }

  const roleColors: Record<string, string> = {
    STUDENT: "bg-blue-100 text-blue-700",
    ORGANIZER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${stat.urgent ? "ring-2 ring-yellow-300" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  {stat.urgent && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {stat.change && (
                    <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Recent Events</CardTitle>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {event.organizer.name} &middot; {formatDateTime(event.startDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {event._count.registrations} reg.
                    </span>
                    <Badge className={`text-[10px] ${statusColors[event.status] || ""}`}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Recent Users</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium">
                        {(user.name || user.email)?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] shrink-0 ${roleColors[user.role] || ""}`}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events by Views */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Events by Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topEvents.map((event, i) => {
              const maxViews = topEvents[0]?.viewCount || 1
              const percentage = Math.max((event.viewCount / maxViews) * 100, 5)
              return (
                <div key={event.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate mr-4">
                      {i + 1}. {event.title}
                    </span>
                    <div className="flex items-center gap-4 shrink-0 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {event.viewCount}
                      </span>
                      <span>{event._count.registrations} reg.</span>
                      <span>{event._count.likes} likes</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {topEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No events yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
