import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/server/auth"
import { getNotifications } from "@/server/queries/events.queries"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, Clock, AlertCircle, MessageSquare, UserPlus } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import { markAllNotificationsRead } from "@/server/actions/notification.actions"

export const metadata = {
  title: "Notifications",
}

const iconMap: Record<string, typeof Bell> = {
  REGISTRATION_CONFIRMED: CheckCircle,
  WAITLIST_PROMOTED: CheckCircle,
  EVENT_REMINDER: Clock,
  EVENT_UPDATED: AlertCircle,
  EVENT_CANCELLED: AlertCircle,
  NEW_COMMENT: MessageSquare,
  NEW_FOLLOWER: UserPlus,
  SYSTEM: Bell,
  ORGANIZER_ANNOUNCEMENT: Bell,
  REVIEW_RECEIVED: Bell,
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/notifications")

  const notifications = await getNotifications(session.user.id, 50)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your events</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <form action={markAllNotificationsRead}>
            <Button variant="outline" size="sm" type="submit">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-muted-foreground mt-1">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell
            return (
              <Card
                key={notification.id}
                className={!notification.isRead ? "border-primary/30 bg-primary/5" : ""}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.isRead && (
                        <Badge className="shrink-0 text-[10px] h-5">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View details
                      </Link>
                    )}
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
