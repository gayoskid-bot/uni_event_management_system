"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export async function processCheckIn(qrCode: string, eventId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const registration = await db.registration.findUnique({
    where: { qrCode },
    include: { event: true, user: true },
  })

  if (!registration) return { error: "Invalid QR code" }
  if (registration.eventId !== eventId) return { error: "This QR code is for a different event" }

  // Verify organizer/admin permission
  if (registration.event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "You don't have permission to check in attendees for this event" }
  }

  if (registration.status === "CANCELLED") {
    return { error: "This registration has been cancelled" }
  }

  if (registration.status === "CHECKED_IN") {
    return {
      error: `${registration.user.name} is already checked in`,
      alreadyCheckedIn: true,
    }
  }

  // Process check-in
  await db.registration.update({
    where: { id: registration.id },
    data: { status: "CHECKED_IN" },
  })

  await db.checkIn.create({
    data: {
      registrationId: registration.id,
      eventId,
      userId: registration.userId,
      checkedInBy: session.user.id,
    },
  })

  revalidatePath(`/dashboard/events/${eventId}/check-in`)
  revalidatePath(`/dashboard/events/${eventId}/registrations`)

  return {
    success: true,
    attendee: {
      name: registration.user.name,
      email: registration.user.email,
    },
  }
}

export async function manualCheckIn(registrationId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const registration = await db.registration.findUnique({
    where: { id: registrationId },
    include: { event: true },
  })

  if (!registration) return { error: "Registration not found" }
  if (registration.event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  if (registration.status === "CHECKED_IN") {
    return { error: "Already checked in" }
  }

  await db.registration.update({
    where: { id: registrationId },
    data: { status: "CHECKED_IN" },
  })

  await db.checkIn.create({
    data: {
      registrationId,
      eventId: registration.eventId,
      userId: registration.userId,
      checkedInBy: session.user.id,
    },
  })

  revalidatePath(`/dashboard/events/${registration.eventId}/check-in`)
  return { success: true }
}
