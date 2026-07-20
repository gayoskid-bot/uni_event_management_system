"use server"

import { redirect } from "next/navigation"
import { auth, updateSession } from "@/server/auth"
import { db } from "@/server/db"
import { z } from "zod"

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500).optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(8).optional(),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).min(1, "Select at least one interest"),
})

export async function completeOnboarding(
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const validated = onboardingSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    department: formData.get("department") || undefined,
    year: formData.get("year") ? Number(formData.get("year")) : undefined,
    phone: formData.get("phone") || undefined,
    image: formData.get("image") || undefined,
    categoryIds: formData.getAll("categoryIds"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { categoryIds, ...profileData } = validated.data

  await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: {
        ...profileData,
        onboardingCompletedAt: new Date(),
      },
    }),
    db.userInterest.deleteMany({ where: { userId: session.user.id } }),
    db.userInterest.createMany({
      data: categoryIds.map((categoryId) => ({
        userId: session.user.id,
        categoryId,
      })),
    }),
  ])

  // Force the session/JWT cookie to refresh with the new onboardingCompleted
  // claim before redirecting — middleware only reads the cookie (it can't
  // query the DB), so without this it would still see the stale pre-onboarding
  // token and immediately bounce back here, causing a redirect loop.
  await updateSession({})

  redirect("/my-dashboard")
}
