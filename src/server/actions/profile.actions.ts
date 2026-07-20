"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(8).optional(),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const validated = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    department: formData.get("department") || undefined,
    year: formData.get("year") ? Number(formData.get("year")) : undefined,
    phone: formData.get("phone") || undefined,
    image: formData.get("image") || undefined,
  })

  if (!validated.success) return { error: validated.error.issues[0].message }

  await db.user.update({
    where: { id: session.user.id },
    data: validated.data,
  })

  revalidatePath("/profile")
  revalidatePath(`/profile/${session.user.id}`)
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.hashedPassword) {
    return { error: "Password change not available for OAuth accounts" }
  }

  const isValid = await bcrypt.compare(currentPassword, user.hashedPassword)
  if (!isValid) return { error: "Current password is incorrect" }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await db.user.update({
    where: { id: session.user.id },
    data: { hashedPassword },
  })

  return { success: true }
}
