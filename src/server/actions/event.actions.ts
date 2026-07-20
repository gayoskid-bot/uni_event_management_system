"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { createEventSchema } from "@/lib/validations/event.schema"
import { slugify } from "@/lib/utils"

export async function createEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  if (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN") {
    return { error: "Only organizers can create events" }
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    summary: (formData.get("summary") as string) || undefined,
    coverImage: (formData.get("coverImage") as string) || undefined,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    timezone: (formData.get("timezone") as string) || "UTC",
    venue: (formData.get("venue") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    isOnline: formData.get("isOnline") === "true",
    onlineLink: (formData.get("onlineLink") as string) || undefined,
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
    waitlistEnabled: formData.get("waitlistEnabled") === "true",
    isFree: formData.get("isFree") !== "false",
    categoryIds: formData.getAll("categoryIds") as string[],
  }

  const validated = createEventSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { categoryIds, tagNames, ...eventData } = validated.data

  // Generate unique slug
  let slug = slugify(eventData.title)
  const existingSlug = await db.event.findUnique({ where: { slug } })
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const event = await db.event.create({
    data: {
      ...eventData,
      slug,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      organizerId: session.user.id,
      categories: {
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
  })

  revalidatePath("/events")
  revalidatePath("/dashboard/events")
  redirect(`/events/${event.slug}`)
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in" }
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
  })

  if (!event) {
    return { error: "Event not found" }
  }

  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "You don't have permission to edit this event" }
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    summary: (formData.get("summary") as string) || undefined,
    coverImage: (formData.get("coverImage") as string) || undefined,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    venue: (formData.get("venue") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    isOnline: formData.get("isOnline") === "true",
    onlineLink: (formData.get("onlineLink") as string) || undefined,
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
    isFree: formData.get("isFree") !== "false",
    categoryIds: formData.getAll("categoryIds") as string[],
  }

  // Update categories
  await db.eventCategory.deleteMany({ where: { eventId } })

  await db.event.update({
    where: { id: eventId },
    data: {
      title: rawData.title,
      description: rawData.description,
      summary: rawData.summary,
      coverImage: rawData.coverImage,
      startDate: new Date(rawData.startDate),
      endDate: new Date(rawData.endDate),
      venue: rawData.venue,
      address: rawData.address,
      isOnline: rawData.isOnline,
      onlineLink: rawData.onlineLink,
      capacity: rawData.capacity,
      isFree: rawData.isFree,
      categories: {
        create: rawData.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
  })

  revalidatePath("/events")
  revalidatePath(`/events/${event.slug}`)
  revalidatePath("/dashboard/events")
  redirect(`/events/${event.slug}`)
}

// Publishing is admin-only: every organizer-created event starts as DRAFT
// and sits in the admin "Pending Review" queue (see /admin/events) until an
// admin approves it. Organizers cannot self-publish, even for their own
// events — that would bypass moderation entirely.
export async function publishEvent(eventId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Only administrators can publish events" }
  }

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return { error: "Event not found" }

  await db.event.update({
    where: { id: eventId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })

  revalidatePath("/events")
  revalidatePath(`/events/${event.slug}`)
}

export async function deleteEvent(eventId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return { error: "Event not found" }
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  await db.event.delete({ where: { id: eventId } })

  revalidatePath("/events")
  revalidatePath("/dashboard/events")
  redirect("/dashboard/events")
}
