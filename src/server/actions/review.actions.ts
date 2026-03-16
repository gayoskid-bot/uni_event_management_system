"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { z } from "zod"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
  eventId: z.string().min(1),
})

export async function createReview(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "You must be logged in" }

  const validated = reviewSchema.safeParse({
    rating: Number(formData.get("rating")),
    content: formData.get("content") || undefined,
    eventId: formData.get("eventId"),
  })

  if (!validated.success) return { error: validated.error.issues[0].message }

  const { rating, content, eventId } = validated.data

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return { error: "Event not found" }
  if (event.status !== "COMPLETED") return { error: "You can only review completed events" }

  // Check if user attended
  const registration = await db.registration.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  })
  if (!registration || registration.status === "CANCELLED") {
    return { error: "You must have attended this event to leave a review" }
  }

  // Check existing review
  const existing = await db.review.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  })
  if (existing) return { error: "You've already reviewed this event" }

  await db.review.create({
    data: { rating, content, eventId, userId: session.user.id },
  })

  // Notify organizer
  await db.notification.create({
    data: {
      userId: event.organizerId,
      type: "REVIEW_RECEIVED",
      title: "New review",
      message: `${session.user.name || "Someone"} left a ${rating}-star review on "${event.title}"`,
      link: `/events/${event.slug}`,
    },
  })

  revalidatePath(`/events/${event.slug}`)
  return { success: true }
}

export async function getEventReviews(eventId: string) {
  return db.review.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getEventAverageRating(eventId: string) {
  const result = await db.review.aggregate({
    where: { eventId },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return {
    average: result._avg.rating || 0,
    count: result._count.rating,
  }
}
