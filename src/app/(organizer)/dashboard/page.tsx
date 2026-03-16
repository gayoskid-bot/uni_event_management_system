import Link from "next/link"
import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { CalendarPlus, CalendarDays, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEventsByOrganizer } from "@/server/queries/events.queries"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const events = await getEventsByOrganizer(session.user.id)

  const totalEvents = events.length
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length
  const totalRegistrations = events.reduce(
    (sum, e) => sum + e._count.registrations,
    0
  )
  const totalViews = events.reduce((sum, e) => sum + (e.viewCount || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Events", value: totalEvents, icon: CalendarDays },
          { label: "Published", value: publishedEvents, icon: CalendarDays },
          { label: "Total Registrations", value: totalRegistrations, icon: Users },
          { label: "Total Views", value: totalViews, icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No events yet. Create your first event!</p>
              <Link href="/dashboard/events/new" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <Link
                      href={`/events/${event.slug}`}
                      className="font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {event._count.registrations} registrations
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        event.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : event.status === "DRAFT"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.status}
                    </span>
                    <Link href={`/dashboard/events/${event.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
