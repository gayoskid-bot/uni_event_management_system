import { db } from "@/server/db"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ExternalLink, Users, Eye, Plus, CalendarDays } from "lucide-react"
import {
  ApproveButton,
  RejectButton,
  ArchiveButton,
  RestoreButton,
  DeleteButton,
  ArchiveExpiredButton,
} from "./event-actions"

export const metadata = { title: "Event Management" }

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = "active" } = await searchParams

  const now = new Date()

  const [activeEvents, pendingEvents, archivedEvents, expiredCount] = await Promise.all([
    db.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startDate: "asc" },
      include: {
        organizer: { select: { name: true, email: true } },
        _count: { select: { registrations: true } },
      },
    }),
    db.event.findMany({
      where: { status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      include: {
        organizer: { select: { name: true, email: true } },
        _count: { select: { registrations: true } },
      },
    }),
    db.event.findMany({
      where: { status: { in: ["COMPLETED", "CANCELLED"] } },
      orderBy: { endDate: "desc" },
      include: {
        organizer: { select: { name: true, email: true } },
        _count: { select: { registrations: true } },
      },
    }),
    db.event.count({
      where: {
        endDate: { lt: now },
        status: { in: ["PUBLISHED", "DRAFT"] },
      },
    }),
  ])

  const tabs = [
    { key: "active", label: "Active", count: activeEvents.length },
    { key: "pending", label: "Pending Review", count: pendingEvents.length },
    { key: "archived", label: "Archived", count: archivedEvents.length },
  ]

  const currentEvents =
    tab === "pending"
      ? pendingEvents
      : tab === "archived"
      ? archivedEvents
      : activeEvents

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage, approve, and archive events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {expiredCount > 0 && <ArchiveExpiredButton />}
          <Link href="/dashboard/events/new">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Expired events alert */}
      {expiredCount > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>{expiredCount}</strong> event{expiredCount !== 1 && "s"} have
            ended but are still marked as active. Click &quot;Archive Expired Events&quot; to move
            them to the archive.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/events?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Events list */}
      {currentEvents.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium">No events in this category</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {currentEvents.map((event) => {
            const isExpired = new Date(event.endDate) < now
            return (
              <Card key={event.id} className={isExpired && event.status === "PUBLISHED" ? "border-yellow-300" : ""}>
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-medium hover:underline truncate"
                      >
                        {event.title}
                      </Link>
                      <Badge className={`text-[10px] ${statusColors[event.status]}`}>
                        {event.status}
                      </Badge>
                      {isExpired && event.status === "PUBLISHED" && (
                        <Badge className="text-[10px] bg-yellow-100 text-yellow-800">
                          EXPIRED
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {event.organizer.name} &middot; {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      <span className="inline-flex items-center gap-1 ml-2">
                        <Users className="h-3 w-3" /> {event._count.registrations}
                      </span>
                      <span className="inline-flex items-center gap-1 ml-2">
                        <Eye className="h-3 w-3" /> {event.viewCount}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {tab === "pending" && (
                      <>
                        <ApproveButton eventId={event.id} />
                        <RejectButton eventId={event.id} />
                      </>
                    )}
                    {tab === "active" && (
                      <ArchiveButton eventId={event.id} />
                    )}
                    {tab === "archived" && (
                      <>
                        <RestoreButton eventId={event.id} />
                        <DeleteButton eventId={event.id} />
                      </>
                    )}
                    <Link href={`/events/${event.slug}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
