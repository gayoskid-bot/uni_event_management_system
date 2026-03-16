"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function toggleFollow(targetUserId: string) {
  const session = await auth()
  if (!session?.user) return { error: "You must be logged in" }
  if (session.user.id === targetUserId) return { error: "You cannot follow yourself" }

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  })

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } })
    return { following: false }
  }

  await db.follow.create({
    data: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  })

  // Notify the followed user
  await db.notification.create({
    data: {
      userId: targetUserId,
      type: "NEW_FOLLOWER",
      title: "New follower",
      message: `${session.user.name || "Someone"} started following you`,
      link: `/profile/${session.user.id}`,
    },
  })

  revalidatePath(`/profile/${targetUserId}`)
  return { following: true }
}

export async function isFollowing(targetUserId: string) {
  const session = await auth()
  if (!session?.user) return false

  const follow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  })

  return !!follow
}
