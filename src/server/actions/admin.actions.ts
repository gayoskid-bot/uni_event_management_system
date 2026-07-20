"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function changeUserRole(userId: string, role: "STUDENT" | "ORGANIZER" | "ADMIN") {
  await requireAdmin()
  await db.user.update({
    where: { id: userId },
    // Stamping sessionInvalidatedAt forces that user's current session to be
    // rejected on their next request (see the jwt callback in auth.ts), so
    // the new role takes effect immediately via a forced re-login instead of
    // silently waiting for them to happen to refresh.
    data: { role, sessionInvalidatedAt: new Date() },
  })
  revalidatePath("/admin/users")
  return { success: true }
}

export async function toggleUserActive(userId: string) {
  await requireAdmin()
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return { error: "User not found" }

  await db.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive, sessionInvalidatedAt: new Date() },
  })
  revalidatePath("/admin/users")
  return { success: true, isActive: !user.isActive }
}

export async function approveOrganizerApplication(applicationId: string) {
  const session = await requireAdmin()

  const application = await db.organizerApplication.findUnique({
    where: { id: applicationId },
  })
  if (!application) return { error: "Application not found" }

  await db.organizerApplication.update({
    where: { id: applicationId },
    data: { status: "APPROVED", reviewedBy: session.user.id, reviewedAt: new Date() },
  })

  await db.user.update({
    where: { id: application.userId },
    data: { role: "ORGANIZER", sessionInvalidatedAt: new Date() },
  })

  await db.notification.create({
    data: {
      userId: application.userId,
      type: "SYSTEM",
      title: "Application Approved!",
      message: "Your organizer application has been approved. You can now create events!",
      link: "/dashboard",
    },
  })

  revalidatePath("/admin/applications")
  return { success: true }
}

export async function rejectOrganizerApplication(applicationId: string) {
  const session = await requireAdmin()

  await db.organizerApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED", reviewedBy: session.user.id, reviewedAt: new Date() },
  })

  revalidatePath("/admin/applications")
  return { success: true }
}

export async function resolveReport(reportId: string) {
  const session = await requireAdmin()

  await db.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolvedBy: session.user.id, resolvedAt: new Date() },
  })

  revalidatePath("/admin/reports")
  return { success: true }
}

export async function approveEvent(eventId: string) {
  await requireAdmin()
  await db.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })
  revalidatePath("/admin/events")
  return { success: true }
}

export async function rejectEvent(eventId: string) {
  await requireAdmin()
  await db.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  })
  revalidatePath("/admin/events")
  return { success: true }
}

export async function archiveEvent(eventId: string) {
  await requireAdmin()
  await db.event.update({
    where: { id: eventId },
    data: { status: "COMPLETED" },
  })
  revalidatePath("/admin/events")
  return { success: true }
}

export async function restoreEvent(eventId: string) {
  await requireAdmin()
  await db.event.update({
    where: { id: eventId },
    data: { status: "PUBLISHED" },
  })
  revalidatePath("/admin/events")
  return { success: true }
}

export async function archiveExpiredEvents() {
  await requireAdmin()
  const result = await db.event.updateMany({
    where: {
      endDate: { lt: new Date() },
      status: { in: ["PUBLISHED", "DRAFT"] },
    },
    data: { status: "COMPLETED" },
  })
  revalidatePath("/admin/events")
  return { success: true, count: result.count }
}

export async function deleteEventAdmin(eventId: string) {
  await requireAdmin()
  await db.event.delete({ where: { id: eventId } })
  revalidatePath("/admin/events")
  return { success: true }
}

export async function createCategory(formData: FormData) {
  await requireAdmin()
  const name = formData.get("name") as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const color = formData.get("color") as string
  const icon = formData.get("icon") as string

  await db.category.create({
    data: { name, slug, color: color || null, icon: icon || null },
  })

  revalidatePath("/admin/categories")
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin()
  await db.category.delete({ where: { id: categoryId } })
  revalidatePath("/admin/categories")
  return { success: true }
}
