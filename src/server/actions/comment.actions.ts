"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  eventId: z.string().min(1),
  parentId: z.string().optional(),
})

export async function createComment(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "You must be logged in" }

  const validated = commentSchema.safeParse({
    content: formData.get("content"),
    eventId: formData.get("eventId"),
    parentId: formData.get("parentId") || undefined,
  })

  if (!validated.success) return { error: validated.error.issues[0].message }

  const { content, eventId, parentId } = validated.data

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return { error: "Event not found" }

  await db.comment.create({
    data: {
      content,
      eventId,
      parentId: parentId || null,
      userId: session.user.id,
    },
  })

  // Notify event organizer (if commenter is not the organizer)
  if (event.organizerId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: event.organizerId,
        type: "NEW_COMMENT",
        title: "New comment on your event",
        message: `${session.user.name || "Someone"} commented on "${event.title}"`,
        link: `/events/${event.slug}`,
      },
    })
  }

  revalidatePath(`/events/${event.slug}`)
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { event: true },
  })

  if (!comment) return { error: "Comment not found" }
  if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  await db.comment.delete({ where: { id: commentId } })
  revalidatePath(`/events/${comment.event.slug}`)
  return { success: true }
}

export async function getEventComments(eventId: string) {
  return db.comment.findMany({
    where: { eventId, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
