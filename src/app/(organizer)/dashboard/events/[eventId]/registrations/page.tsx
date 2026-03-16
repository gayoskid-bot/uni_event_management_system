import { notFound, redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, Download, CheckCircle, Clock, XCircle } from "lucide-react"
import { formatDateTime, getInitials } from "@/lib/utils"
import Link from "next/link"

interface RegistrationsPageProps {
  params: Promise<{ eventId: string }>
}

export const metadata = { title: "Event Registrations" }

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  CONFIRMED: { icon: CheckCircle, color: "text-green-600", label: "Confirmed" },
  WAITLISTED: { icon: Clock, color: "text-yellow-600", label: "Waitlisted" },
  CANCELLED: { icon: XCircle, color: "text-red-600", label: "Cancelled" },
  CHECKED_IN: { icon: CheckCircle, color: "text-blue-600", label: "Checked In" },
}

export default async function RegistrationsPage({ params }: RegistrationsPageProps) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { eventId } = await params

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true, department: true } },
        },
        orderBy: { registeredAt: "desc" },
      },
    },
  })

  if (!event) notFound()
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard/events")
  }

  const confirmed = event.registrations.filter((r) => r.status === "CONFIRMED" || r.status === "CHECKED_IN")
  const waitlisted = event.registrations.filter((r) => r.status === "WAITLISTED")
  const cancelled = event.registrations.filter((r) => r.status === "CANCELLED")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registrations</h1>
          <p className="text-muted-foreground mt-1">{event.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/events/${eventId}/edit`}>
            <Button variant="outline" size="sm">Edit Event</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{confirmed.length}</div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{waitlisted.length}</div>
            <div className="text-xs text-muted-foreground">Waitlisted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{cancelled.length}</div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{event.capacity || "∞"}</div>
            <div className="text-xs text-muted-foreground">Capacity</div>
          </CardContent>
        </Card>
      </div>

      {/* Registration List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendees ({event.registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {event.registrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No registrations yet</p>
          ) : (
            <div className="space-y-2">
              {event.registrations.map((reg) => {
                const config = statusConfig[reg.status]
                const StatusIcon = config?.icon || CheckCircle
                return (
                  <div
                    key={reg.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={reg.user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(reg.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reg.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reg.user.email}
                        {reg.user.department && ` · ${reg.user.department}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusIcon className={`h-4 w-4 ${config?.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(reg.registeredAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
