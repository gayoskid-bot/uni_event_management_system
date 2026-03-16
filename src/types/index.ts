import type {
  Event,
  User,
  Category,
  Tag,
  TicketTier,
  Registration,
  EventImage,
  Comment,
  Review,
} from "@prisma/client"

export type EventWithDetails = Event & {
  organizer: Pick<User, "id" | "name" | "image">
  categories: {
    category: Category
  }[]
  tags: {
    tag: Tag
  }[]
  ticketTiers: TicketTier[]
  images: EventImage[]
  _count: {
    registrations: number
    likes: number
    comments: number
    bookmarks: number
  }
}

export type EventCardData = Pick<
  Event,
  | "id"
  | "title"
  | "slug"
  | "summary"
  | "coverImage"
  | "startDate"
  | "endDate"
  | "venue"
  | "isOnline"
  | "isFree"
  | "capacity"
  | "status"
> & {
  organizer: Pick<User, "id" | "name" | "image">
  categories: {
    category: Pick<Category, "id" | "name" | "slug" | "color" | "icon">
  }[]
  _count: {
    registrations: number
    likes: number
  }
}

export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "name" | "image">
  replies?: CommentWithUser[]
}

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">
}

export type RegistrationWithEvent = Registration & {
  event: Pick<Event, "id" | "title" | "slug" | "coverImage" | "startDate" | "endDate" | "venue">
}

export type UserProfile = Pick<
  User,
  "id" | "name" | "email" | "image" | "bio" | "department" | "year" | "role" | "createdAt"
> & {
  _count: {
    organizedEvents: number
    followers: number
    following: number
  }
}
