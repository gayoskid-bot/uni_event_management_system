import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export const metadata = { title: "Welcome to UniEvents" }

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [user, categories] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        bio: true,
        department: true,
        year: true,
        phone: true,
        image: true,
        onboardingCompletedAt: true,
      },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ])

  if (!user) redirect("/login")

  // Deliberately not an automatic redirect() here: middleware's own
  // onboarding check (which can only read the session cookie, not the DB)
  // may occasionally still think onboarding is incomplete for a moment
  // after it actually finishes. If this page also auto-redirected away
  // whenever the DB says "done", the two could contradict each other and
  // redirect-loop forever. Showing a plain link instead of redirecting
  // breaks that loop unconditionally.
  if (user.onboardingCompletedAt) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 mb-2" />
          <CardTitle>You&apos;re all set!</CardTitle>
          <CardDescription>You&apos;ve already completed onboarding.</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Link href="/my-dashboard">
            <Button className="w-full">Go to My Dashboard</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return <OnboardingFlow user={user} categories={categories} />
}
