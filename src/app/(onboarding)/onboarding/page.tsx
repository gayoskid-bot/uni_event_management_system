import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

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
  if (user.onboardingCompletedAt) redirect("/my-dashboard")

  return <OnboardingFlow user={user} categories={categories} />
}
