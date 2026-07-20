import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/server/auth"
import { getUserRegisteredEvents } from "@/server/queries/events.queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin, QrCode, ExternalLink } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export const metadata = {
  title: "My Events",
}

export default async function MyEventsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/my-events")

  const events = await getUserRegisteredEvents(session.user.id)

  const upcomingEvents = events.filter(
    (e) => new Date(e.startDate) >= new Date()
  )
  const pastEvents = events.filter(
    (e) => new Date(e.startDate) < new Date()
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <p className="text-muted-foreground mt-1">Events you&apos;re registered for</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No events yet</h3>
          <p className="text-muted-foreground mt-1">
            Browse events and register for ones that interest you
          </p>
          <Link href="/events" className="mt-4 inline-block">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Upcoming ({upcomingEvents.length})
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventRegistrationCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                Past Events ({pastEvents.length})
              </h2>
              <div className="space-y-4 opacity-75">
                {pastEvents.map((event) => (
                  <EventRegistrationCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventRegistrationCard({
  event,
}: {
  event: {
    id: string
    title: string
    slug: string
    coverImage: string | null
    startDate: Date
    endDate: Date
    venue: string | null
    isOnline: boolean
    registrationStatus: string
    qrCode: string | null
    registrationId: string
  }
}) {
  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    WAITLISTED: "bg-yellow-100 text-yellow-800",
    CHECKED_IN: "bg-blue-100 text-blue-800",
  }

  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-muted">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/events/${event.slug}`}
              className="font-semibold hover:underline truncate"
            >
              {event.title}
            </Link>
            <Badge
              className={`shrink-0 text-[10px] ${statusColors[event.registrationStatus] || ""}`}
            >
              {event.registrationStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateTime(event.startDate)}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.venue}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {event.qrCode &&
              (event.registrationStatus === "CONFIRMED" ||
                event.registrationStatus === "CHECKED_IN") && (
                <Link href={`/my-events/${event.registrationId}/ticket`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <QrCode className="h-3 w-3" />
                    View Ticket
                  </Button>
                </Link>
              )}
            <Link href={`/events/${event.slug}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <ExternalLink className="h-3 w-3" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
