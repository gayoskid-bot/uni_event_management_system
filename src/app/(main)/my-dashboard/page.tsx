import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  MapPin,
  Clock,
  Bookmark,
  Heart,
  Ticket,
  ArrowRight,
  CalendarCheck,
  TrendingUp,
  Bell,
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export const metadata = { title: "My Dashboard" }

export default async function UserDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/my-dashboard")

  const userId = session.user.id

  // Fetch all dashboard data in parallel
  const [
    upcomingRegistrations,
    pastRegistrations,
    bookmarkCount,
    likeCount,
    unreadNotifications,
    recentBookmarks,
  ] = await Promise.all([
    db.registration.findMany({
      where: {
        userId,
        status: { in: ["CONFIRMED", "WAITLISTED", "CHECKED_IN"] },
        event: { startDate: { gte: new Date() } },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            startDate: true,
            endDate: true,
            venue: true,
            isOnline: true,
            organizer: { select: { name: true } },
            categories: {
              select: { category: { select: { name: true, color: true } } },
              take: 2,
            },
          },
        },
      },
      orderBy: { event: { startDate: "asc" } },
      take: 5,
    }),
    db.registration.count({
      where: {
        userId,
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        event: { startDate: { lt: new Date() } },
      },
    }),
    db.bookmark.count({ where: { userId } }),
    db.eventLike.count({ where: { userId } }),
    db.notification.count({ where: { userId, isRead: false } }),
    db.bookmark.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            startDate: true,
            venue: true,
            isFree: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  const stats = [
    {
      label: "Upcoming Events",
      value: upcomingRegistrations.length,
      icon: CalendarCheck,
      color: "text-blue-600 bg-blue-50",
      href: "/my-events",
    },
    {
      label: "Events Attended",
      value: pastRegistrations,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
      href: "/my-events",
    },
    {
      label: "Saved Events",
      value: bookmarkCount,
      icon: Bookmark,
      color: "text-purple-600 bg-purple-50",
      href: "/bookmarks",
    },
    {
      label: "Liked Events",
      value: likeCount,
      icon: Heart,
      color: "text-red-600 bg-red-50",
      href: "/events",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your events
          </p>
        </div>
        {unreadNotifications > 0 && (
          <Link href="/notifications">
            <Button variant="outline" className="gap-2">
              <Bell className="h-4 w-4" />
              {unreadNotifications} new notification{unreadNotifications !== 1 && "s"}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Events - Main Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <Link href="/my-events">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-medium">No upcoming events</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Browse events and register for ones that interest you
                  </p>
                  <Link href="/events">
                    <Button size="sm">Explore Events</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingRegistrations.map((reg) => (
                    <Link
                      key={reg.id}
                      href={`/events/${reg.event.slug}`}
                      className="flex gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-muted">
                        {reg.event.coverImage ? (
                          <Image
                            src={reg.event.coverImage}
                            alt={reg.event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <CalendarDays className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {reg.event.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[10px] ${
                              reg.status === "CONFIRMED"
                                ? "border-green-300 text-green-700 bg-green-50"
                                : reg.status === "WAITLISTED"
                                ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                : "border-blue-300 text-blue-700 bg-blue-50"
                            }`}
                          >
                            {reg.status === "CHECKED_IN" ? "Checked In" : reg.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDateTime(reg.event.startDate)}
                          </span>
                          {reg.event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {reg.event.venue}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {reg.event.categories.map((ec) => (
                            <span
                              key={ec.category.name}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: ec.category.color + "20",
                                color: ec.category.color,
                              }}
                            >
                              {ec.category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/events" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/my-events" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Ticket className="h-4 w-4" />
                  My Registrations
                </Button>
              </Link>
              <Link href="/bookmarks" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Bookmark className="h-4 w-4" />
                  Saved Events
                </Button>
              </Link>
              <Link href="/profile/settings" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Clock className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Saved Events */}
          {recentBookmarks.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Saved Events</CardTitle>
                <Link href="/bookmarks">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    See all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentBookmarks.map((bm) => (
                  <Link
                    key={bm.id}
                    href={`/events/${bm.event.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted">
                      {bm.event.coverImage ? (
                        <Image
                          src={bm.event.coverImage}
                          alt={bm.event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {bm.event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(bm.event.startDate)}
                      </p>
                    </div>
                    {bm.event.isFree && (
                      <Badge variant="secondary" className="text-[10px]">
                        Free
                      </Badge>
                    )}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
