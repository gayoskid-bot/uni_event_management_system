import { db } from "@/server/db"
import type { EventStatus } from "@prisma/client"

const eventCardSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  coverImage: true,
  startDate: true,
  endDate: true,
  venue: true,
  isOnline: true,
  isFree: true,
  capacity: true,
  status: true,
  createdAt: true,
  organizer: {
    select: { id: true, name: true, image: true },
  },
  categories: {
    select: {
      category: {
        select: { id: true, name: true, slug: true, color: true, icon: true },
      },
    },
  },
  _count: {
    select: { registrations: true, likes: true },
  },
} as const

export async function getEvents({
  search,
  categorySlug,
  status = "PUBLISHED",
  isFree,
  fromDate,
  toDate,
  page = 1,
  limit = 12,
}: {
  search?: string
  categorySlug?: string
  status?: EventStatus
  isFree?: boolean
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
} = {}) {
  const where: Record<string, unknown> = { status }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (categorySlug) {
    where.categories = {
      some: { category: { slug: categorySlug } },
    }
  }

  if (isFree !== undefined) {
    where.isFree = isFree
  }

  if (fromDate || toDate) {
    where.startDate = {}
    if (fromDate) {
      (where.startDate as Record<string, unknown>).gte = new Date(fromDate)
    }
    if (toDate) {
      (where.startDate as Record<string, unknown>).lte = new Date(toDate + "T23:59:59")
    }
  }

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      select: eventCardSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.event.count({ where }),
  ])

  return {
    events,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function getEventBySlug(slug: string) {
  const event = await db.event.findUnique({
    where: { slug },
    include: {
      organizer: {
        select: { id: true, name: true, image: true, bio: true },
      },
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
      ticketTiers: {
        orderBy: { sortOrder: "asc" },
      },
      images: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          registrations: true,
          likes: true,
          comments: true,
          bookmarks: true,
        },
      },
    },
  })

  if (event) {
    // Increment view count
    await db.event.update({
      where: { id: event.id },
      data: { viewCount: { increment: 1 } },
    })
  }

  return event
}

export async function getUpcomingEvents(limit = 6) {
  return db.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gte: new Date() },
    },
    select: eventCardSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getTrendingEvents(limit = 6) {
  return db.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gte: new Date() },
    },
    select: eventCardSelect,
    orderBy: { registrations: { _count: "desc" } },
    take: limit,
  })
}

export async function getEventsByOrganizer(organizerId: string) {
  return db.event.findMany({
    where: { organizerId },
    select: {
      ...eventCardSelect,
      status: true,
      createdAt: true,
      viewCount: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { events: true },
      },
    },
  })
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
  })
}

export async function getUserBookmarkedEvents(userId: string) {
  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: {
      event: {
        select: eventCardSelect,
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return bookmarks.map((b) => b.event)
}

export async function getUserRegisteredEvents(userId: string) {
  const registrations = await db.registration.findMany({
    where: {
      userId,
      status: { in: ["CONFIRMED", "WAITLISTED", "CHECKED_IN"] },
    },
    include: {
      event: {
        select: {
          ...eventCardSelect,
          onlineLink: true,
        },
      },
    },
    orderBy: { registeredAt: "desc" },
  })
  return registrations.map((r) => ({
    ...r.event,
    registrationStatus: r.status,
    registrationId: r.id,
    qrCode: r.qrCode,
  }))
}

export async function getUserRegistration(eventId: string, userId: string) {
  return db.registration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })
}

export async function getNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({
    where: { userId, isRead: false },
  })
}
