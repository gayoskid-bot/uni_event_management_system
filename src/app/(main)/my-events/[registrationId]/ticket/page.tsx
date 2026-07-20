import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QRCodeDisplay } from "@/components/dashboard/qr-code-display"
import { ArrowLeft, CalendarDays, MapPin, Globe } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export const metadata = { title: "My Ticket" }

interface TicketPageProps {
  params: Promise<{ registrationId: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { registrationId } = await params

  const registration = await db.registration.findUnique({
    where: { id: registrationId },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          startDate: true,
          venue: true,
          isOnline: true,
          onlineLink: true,
        },
      },
    },
  })

  if (!registration) notFound()
  if (registration.userId !== session.user.id) redirect("/my-events")

  const isValid = registration.status === "CONFIRMED" || registration.status === "CHECKED_IN"

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    WAITLISTED: "bg-yellow-100 text-yellow-800",
    CHECKED_IN: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <Link
        href="/my-events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to My Events
      </Link>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{registration.event.title}</CardTitle>
          <div className="flex justify-center">
            <Badge className={statusColors[registration.status] || ""}>
              {registration.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateTime(registration.event.startDate)}
            </div>
            {registration.event.isOnline ? (
              <div className="flex items-center justify-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Online Event
              </div>
            ) : registration.event.venue ? (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {registration.event.venue}
              </div>
            ) : null}
          </div>

          {isValid && registration.qrCode ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-6">
              <QRCodeDisplay data={registration.qrCode} size={220} />
              <p className="text-xs text-muted-foreground text-center">
                Present this code at the event venue for check-in
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              {registration.status === "WAITLISTED"
                ? "You're on the waitlist — your ticket QR code will appear here once a spot opens up."
                : registration.status === "CANCELLED"
                ? "This registration has been cancelled."
                : "No ticket available."}
            </div>
          )}

          <Link href={`/events/${registration.event.slug}`} className="block">
            <Button variant="outline" className="w-full">
              View Event Details
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
