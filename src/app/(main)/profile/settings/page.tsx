import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      bio: true,
      department: true,
      year: true,
      phone: true,
      image: true,
      hashedPassword: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <ProfileSettingsForm user={user} canChangePassword={!!user.hashedPassword} />
    </div>
  )
}
