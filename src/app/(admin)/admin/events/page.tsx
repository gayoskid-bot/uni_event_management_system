import { db } from "@/server/db"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ExternalLink, Users, Eye } from "lucide-react"

export const metadata = { title: "Event Management" }

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
}

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organizer: { select: { name: true, email: true } },
      _count: { select: { registrations: true } },
    },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground mt-1">{events.length} events</p>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/events/${event.slug}`} className="font-medium hover:underline truncate">
                    {event.title}
                  </Link>
                  <Badge className={`text-[10px] ${statusColors[event.status]}`}>{event.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  by {event.organizer.name} ({event.organizer.email}) ·
                  {formatDate(event.startDate)} ·
                  <span className="inline-flex items-center gap-1 ml-1">
                    <Users className="h-3 w-3" /> {event._count.registrations}
                  </span>
                  <span className="inline-flex items-center gap-1 ml-2">
                    <Eye className="h-3 w-3" /> {event.viewCount}
                  </span>
                </p>
              </div>
              <Link href={`/events/${event.slug}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
