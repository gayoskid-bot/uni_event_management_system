import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUnreadNotificationCount } from "@/server/queries/events.queries"

interface NotificationBellProps {
  userId: string
}

export async function NotificationBell({ userId }: NotificationBellProps) {
  const unreadCount = await getUnreadNotificationCount(userId)

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  )
}
