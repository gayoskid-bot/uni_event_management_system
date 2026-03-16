"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function toggleBookmark(eventId: string) {
  const session = await auth()
  if (!session?.user) return { error: "You must be logged in" }

  const existing = await db.bookmark.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  })

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } })
    revalidatePath("/bookmarks")
    return { bookmarked: false }
  }

  await db.bookmark.create({
    data: { userId: session.user.id, eventId },
  })

  revalidatePath("/bookmarks")
  return { bookmarked: true }
}

export async function isBookmarked(eventId: string) {
  const session = await auth()
  if (!session?.user) return false

  const bookmark = await db.bookmark.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  })

  return !!bookmark
}
