import Link from "next/link"
import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import { getEventsByOrganizer } from "@/server/queries/events.queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CalendarPlus,
  Eye,
  Users,
  MoreHorizontal,
  Pencil,
  BarChart3,
  ClipboardList,
  Trash2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "My Events" }

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
}

export default async function OrganizerEventsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const events = await getEventsByOrganizer(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">{events.length} events total</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No events yet</h3>
            <p className="text-muted-foreground mt-1">Create your first event to get started</p>
            <Link href="/dashboard/events/new" className="mt-4 inline-block">
              <Button>Create Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {event.title}
                      </Link>
                      <Badge className={`shrink-0 text-[10px] ${statusColors[event.status]}`}>
                        {event.status === "DRAFT" ? "Pending Admin Approval" : event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(event.startDate)}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event._count.registrations} registered
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {event.viewCount} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/dashboard/events/${event.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/registrations`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/analytics`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
