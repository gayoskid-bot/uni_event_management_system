import { notFound, redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Users, Heart, MessageSquare, Bookmark, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface AnalyticsPageProps {
  params: Promise<{ eventId: string }>
}

export const metadata = { title: "Event Analytics" }

export default async function EventAnalyticsPage({ params }: AnalyticsPageProps) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { eventId } = await params

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          registrations: true,
          likes: true,
          comments: true,
          bookmarks: true,
          checkIns: true,
        },
      },
    },
  })

  if (!event) notFound()
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard/events")
  }

  const checkInRate = event._count.registrations > 0
    ? Math.round((event._count.checkIns / event._count.registrations) * 100)
    : 0

  const stats = [
    { label: "Total Views", value: event.viewCount, icon: Eye, color: "text-blue-600" },
    { label: "Registrations", value: event._count.registrations, icon: Users, color: "text-green-600" },
    { label: "Check-ins", value: event._count.checkIns, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Check-in Rate", value: `${checkInRate}%`, icon: CheckCircle, color: "text-cyan-600" },
    { label: "Likes", value: event._count.likes, icon: Heart, color: "text-red-600" },
    { label: "Comments", value: event._count.comments, icon: MessageSquare, color: "text-purple-600" },
    { label: "Bookmarks", value: event._count.bookmarks, icon: Bookmark, color: "text-yellow-600" },
    { label: "Capacity", value: event.capacity || "Unlimited", icon: Users, color: "text-gray-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">{event.title}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${eventId}/registrations`}>
            <Button variant="outline" size="sm">View Registrations</Button>
          </Link>
          <Link href={`/dashboard/events/${eventId}/edit`}>
            <Button variant="outline" size="sm">Edit Event</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Engagement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Registration to View Ratio</span>
              <span className="font-medium">
                {event.viewCount > 0
                  ? `${Math.round((event._count.registrations / event.viewCount) * 100)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{
                  width: `${event.viewCount > 0 ? Math.min((event._count.registrations / event.viewCount) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Capacity Filled</span>
              <span className="font-medium">
                {event.capacity
                  ? `${Math.round((event._count.registrations / event.capacity) * 100)}%`
                  : "No limit"}
              </span>
            </div>
            {event.capacity && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 rounded-full h-2 transition-all"
                  style={{
                    width: `${Math.min((event._count.registrations / event.capacity) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
