import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, formatDate } from "@/lib/utils"
import { AdminUserActions } from "./user-actions"

export const metadata = { title: "User Management" }

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      department: true,
      _count: { select: { organizedEvents: true, registrations: true } },
    },
  })

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-800",
    ORGANIZER: "bg-blue-100 text-blue-800",
    STUDENT: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">{users.length} total users</p>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id} className={!user.isActive ? "opacity-60" : ""}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>{getInitials(user.name || "U")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{user.name}</span>
                  <Badge className={`text-[10px] ${roleColors[user.role]}`}>{user.role}</Badge>
                  {!user.isActive && <Badge variant="destructive" className="text-[10px]">Banned</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.department && `${user.department} · `}
                  Joined {formatDate(user.createdAt)} ·
                  {user._count.organizedEvents} events · {user._count.registrations} registrations
                </p>
              </div>
              <AdminUserActions userId={user.id} role={user.role} isActive={user.isActive} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
