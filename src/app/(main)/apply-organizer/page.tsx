import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { ApplyOrganizerForm } from "@/components/organizer/apply-organizer-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export const metadata = { title: "Apply to Become an Organizer" }

export default async function ApplyOrganizerPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/apply-organizer")

  if (session.user.role === "ORGANIZER" || session.user.role === "ADMIN") {
    redirect("/dashboard")
  }

  const latestApplication = await db.organizerApplication.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Become an Organizer</h1>
        <p className="text-muted-foreground mt-2">
          Organizers can create and manage their own events, track registrations, and view analytics.
        </p>
      </div>

      {latestApplication?.status === "PENDING" ? (
        <Card>
          <CardHeader className="text-center">
            <Clock className="mx-auto h-10 w-10 text-yellow-500 mb-2" />
            <CardTitle>Application Pending</CardTitle>
            <CardDescription>
              Your request is awaiting review by an administrator. We&apos;ll notify you once a decision has been made.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Badge variant="secondary">Submitted {latestApplication.createdAt.toLocaleDateString()}</Badge>
          </CardContent>
        </Card>
      ) : latestApplication?.status === "REJECTED" ? (
        <>
          <Card className="mb-6">
            <CardHeader className="text-center">
              <XCircle className="mx-auto h-10 w-10 text-destructive mb-2" />
              <CardTitle>Previous Application Not Approved</CardTitle>
              <CardDescription>
                Your last request wasn&apos;t approved, but you&apos;re welcome to apply again with more detail.
              </CardDescription>
            </CardHeader>
          </Card>
          <ApplyOrganizerForm />
        </>
      ) : latestApplication?.status === "APPROVED" ? (
        <Card>
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 mb-2" />
            <CardTitle>You&apos;re Approved!</CardTitle>
            <CardDescription>
              Refresh the page or log out and back in to access your organizer dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ApplyOrganizerForm />
      )}
    </div>
  )
}
