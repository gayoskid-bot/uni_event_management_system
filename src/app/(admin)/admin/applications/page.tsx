import { db } from "@/server/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ApplicationActions } from "./application-actions"

export const metadata = { title: "Organizer Applications" }

export default async function AdminApplicationsPage() {
  const applications = await db.organizerApplication.findMany({
    orderBy: { createdAt: "desc" },
  })

  const users = await db.user.findMany({
    where: { id: { in: applications.map((a) => a.userId) } },
    select: { id: true, name: true, email: true },
  })

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organizer Applications</h1>
        <p className="text-muted-foreground mt-1">
          {applications.filter((a) => a.status === "PENDING").length} pending
        </p>
      </div>

      {applications.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No applications yet</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const user = userMap[app.userId]
            return (
              <Card key={app.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{user?.name || "Unknown"}</span>
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                        <Badge className={`text-[10px] ${statusColors[app.status]}`}>
                          {app.status}
                        </Badge>
                      </div>
                      {app.organization && (
                        <p className="text-sm text-muted-foreground">Org: {app.organization}</p>
                      )}
                      <p className="text-sm mt-1">{app.reason}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                    {app.status === "PENDING" && (
                      <ApplicationActions applicationId={app.id} />
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
