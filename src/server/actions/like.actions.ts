"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function toggleLike(eventId: string) {
  const session = await auth()
  if (!session?.user) return { error: "You must be logged in" }

  const existing = await db.eventLike.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  })

  if (existing) {
    await db.eventLike.delete({ where: { id: existing.id } })
    return { liked: false }
  }

  await db.eventLike.create({
    data: { userId: session.user.id, eventId },
  })

  return { liked: true }
}

export async function isLiked(eventId: string) {
  const session = await auth()
  if (!session?.user) return false

  const like = await db.eventLike.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  })

  return !!like
}
