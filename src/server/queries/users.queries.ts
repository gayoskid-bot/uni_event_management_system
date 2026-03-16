import { db } from "@/server/db"

export async function getUserProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      department: true,
      year: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          organizedEvents: true,
          followers: true,
          following: true,
        },
      },
    },
  })
}

export async function getUserRegistrations(userId: string) {
  return db.registration.findMany({
    where: {
      userId,
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          startDate: true,
          endDate: true,
          venue: true,
        },
      },
    },
    orderBy: { registeredAt: "desc" },
  })
}
