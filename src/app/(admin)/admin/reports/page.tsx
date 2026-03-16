import { db } from "@/server/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ReportActions } from "./report-actions"

export const metadata = { title: "Reports" }

export default async function AdminReportsPage() {
  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    REVIEWED: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">
          {reports.filter((r) => r.status === "PENDING").length} pending reports
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No reports</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {report.targetType}
                      </Badge>
                      <Badge className={`text-[10px] ${statusColors[report.status]}`}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{report.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target ID: {report.targetId} · Reported {formatDate(report.createdAt)}
                    </p>
                  </div>
                  {report.status === "PENDING" && (
                    <ReportActions reportId={report.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
