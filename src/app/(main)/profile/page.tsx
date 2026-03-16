import { redirect } from "next/navigation"
import { auth } from "@/server/auth"

export default async function ProfileRedirect() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/profile")
  redirect(`/profile/${session.user.id}`)
}
