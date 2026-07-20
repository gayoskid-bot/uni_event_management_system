"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { z } from "zod"

const applicationSchema = z.object({
  reason: z.string().min(20, "Please tell us a bit more (at least 20 characters)"),
  organization: z.string().optional(),
})

export async function applyForOrganizer(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  if (session.user.role === "ORGANIZER" || session.user.role === "ADMIN") {
    return { error: "You already have organizer access" }
  }

  const existing = await db.organizerApplication.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  })
  if (existing) {
    return { error: "You already have a pending application" }
  }

  const validated = applicationSchema.safeParse({
    reason: formData.get("reason"),
    organization: formData.get("organization") || undefined,
  })
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  await db.organizerApplication.create({
    data: {
      userId: session.user.id,
      reason: validated.data.reason,
      organization: validated.data.organization,
    },
  })

  revalidatePath("/apply-organizer")
  revalidatePath("/my-dashboard")
  return { success: true }
}
