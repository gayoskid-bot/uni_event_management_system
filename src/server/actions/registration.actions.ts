"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import crypto from "crypto"

export async function registerForEvent(eventId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in to register" }
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { registrations: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } } },
    },
  })

  if (!event) return { error: "Event not found" }
  if (event.status !== "PUBLISHED") return { error: "This event is not accepting registrations" }

  // Check if already registered
  const existingRegistration = await db.registration.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  })

  if (existingRegistration) {
    if (existingRegistration.status === "CANCELLED") {
      // Re-register cancelled registration
      const status = event.capacity && event._count.registrations >= event.capacity
        ? "WAITLISTED"
        : "CONFIRMED"

      const registration = await db.registration.update({
        where: { id: existingRegistration.id },
        data: {
          status,
          cancelledAt: null,
          qrCode: crypto.randomUUID(),
          registeredAt: new Date(),
          waitlistPosition: status === "WAITLISTED"
            ? await getNextWaitlistPosition(eventId)
            : null,
        },
      })

      revalidatePath(`/events/${event.slug}`)
      revalidatePath("/my-events")
      return { success: true, status: registration.status }
    }
    return { error: "You are already registered for this event" }
  }

  // Determine status based on capacity
  const isFull = event.capacity && event._count.registrations >= event.capacity

  if (isFull && !event.waitlistEnabled) {
    return { error: "This event is full" }
  }

  const status = isFull ? "WAITLISTED" : "CONFIRMED"
  const waitlistPosition = status === "WAITLISTED"
    ? await getNextWaitlistPosition(eventId)
    : null

  const registration = await db.registration.create({
    data: {
      eventId,
      userId: session.user.id,
      status,
      qrCode: crypto.randomUUID(),
      waitlistPosition,
    },
  })

  // Create notification
  await db.notification.create({
    data: {
      userId: session.user.id,
      type: status === "CONFIRMED" ? "REGISTRATION_CONFIRMED" : "WAITLIST_PROMOTED",
      title: status === "CONFIRMED" ? "Registration Confirmed" : "Added to Waitlist",
      message: status === "CONFIRMED"
        ? `You're registered for "${event.title}"!`
        : `You've been added to the waitlist for "${event.title}" (position #${waitlistPosition})`,
      link: `/events/${event.slug}`,
    },
  })

  revalidatePath(`/events/${event.slug}`)
  revalidatePath("/my-events")
  return { success: true, status: registration.status }
}

export async function cancelRegistration(eventId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const registration = await db.registration.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    include: { event: true },
  })

  if (!registration) return { error: "Registration not found" }
  if (registration.status === "CANCELLED") return { error: "Already cancelled" }

  await db.registration.update({
    where: { id: registration.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  })

  // Promote next waitlisted user
  if (registration.status === "CONFIRMED") {
    await promoteFromWaitlist(eventId)
  }

  revalidatePath(`/events/${registration.event.slug}`)
  revalidatePath("/my-events")
  return { success: true }
}

async function promoteFromWaitlist(eventId: string) {
  const nextWaitlisted = await db.registration.findFirst({
    where: { eventId, status: "WAITLISTED" },
    orderBy: { waitlistPosition: "asc" },
    include: { event: true },
  })

  if (!nextWaitlisted) return

  await db.registration.update({
    where: { id: nextWaitlisted.id },
    data: {
      status: "CONFIRMED",
      waitlistPosition: null,
    },
  })

  await db.notification.create({
    data: {
      userId: nextWaitlisted.userId,
      type: "WAITLIST_PROMOTED",
      title: "You're in!",
      message: `A spot opened up for "${nextWaitlisted.event.title}" and you've been moved off the waitlist!`,
      link: `/events/${nextWaitlisted.event.slug}`,
    },
  })
}

async function getNextWaitlistPosition(eventId: string): Promise<number> {
  const lastWaitlisted = await db.registration.findFirst({
    where: { eventId, status: "WAITLISTED" },
    orderBy: { waitlistPosition: "desc" },
  })
  return (lastWaitlisted?.waitlistPosition || 0) + 1
}
