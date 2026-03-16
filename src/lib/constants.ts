export const APP_NAME = "UniEvents"
export const APP_DESCRIPTION = "Discover and manage university events"

export const DEFAULT_CATEGORIES = [
  { name: "Academic", slug: "academic", icon: "GraduationCap", color: "#3B82F6" },
  { name: "Social", slug: "social", icon: "Users", color: "#EC4899" },
  { name: "Sports", slug: "sports", icon: "Trophy", color: "#10B981" },
  { name: "Cultural", slug: "cultural", icon: "Music", color: "#F59E0B" },
  { name: "Career", slug: "career", icon: "Briefcase", color: "#6366F1" },
  { name: "Workshop", slug: "workshop", icon: "Wrench", color: "#8B5CF6" },
  { name: "Seminar", slug: "seminar", icon: "Presentation", color: "#06B6D4" },
  { name: "Networking", slug: "networking", icon: "Handshake", color: "#F97316" },
  { name: "Volunteering", slug: "volunteering", icon: "Heart", color: "#EF4444" },
  { name: "Club", slug: "club", icon: "Flag", color: "#14B8A6" },
  { name: "Tech", slug: "tech", icon: "Laptop", color: "#0EA5E9" },
  { name: "Health & Wellness", slug: "health-wellness", icon: "HeartPulse", color: "#22C55E" },
] as const

export const EVENT_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  PUBLISHED: { label: "Published", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-800" },
} as const

export const ROLES = {
  STUDENT: { label: "Student", description: "Browse and register for events" },
  ORGANIZER: { label: "Organizer", description: "Create and manage events" },
  ADMIN: { label: "Admin", description: "Full platform management" },
} as const
