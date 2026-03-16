"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { z } from "zod"
import { sendEmail } from "@/lib/email/send"

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(5000),
  eventId: z.string().min(1),
})

export async function createAnnouncement(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const validated = announcementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    eventId: formData.get("eventId"),
  })

  if (!validated.success) return { error: validated.error.issues[0].message }
  const { title, content, eventId } = validated.data

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return { error: "Event not found" }
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  await db.announcement.create({
    data: { title, content, eventId },
  })

  // Notify all registered attendees
  const registrations = await db.registration.findMany({
    where: { eventId, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
    include: { user: true },
  })

  for (const reg of registrations) {
    await db.notification.create({
      data: {
        userId: reg.userId,
        type: "ORGANIZER_ANNOUNCEMENT",
        title: `Announcement: ${title}`,
        message: content.slice(0, 200),
        link: `/events/${event.slug}`,
      },
    })

    // Send email (async, don't block)
    sendEmail({
      to: reg.user.email,
      subject: `[${event.title}] ${title}`,
      html: `<p>Hi ${reg.user.name},</p><p>${content}</p><p>- ${session.user.name || "Event Organizer"}</p>`,
    }).catch(console.error)
  }

  revalidatePath(`/dashboard/events/${eventId}/announcements`)
  return { success: true, count: registrations.length }
}
