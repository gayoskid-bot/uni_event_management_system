"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function markNotificationRead(notificationId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  })

  revalidatePath("/notifications")
}

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user) return

  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })

  revalidatePath("/notifications")
}
