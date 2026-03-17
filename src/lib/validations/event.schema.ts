import { z } from "zod"

const baseEventFields = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  summary: z.string().max(300).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  timezone: z.string().default("UTC"),
  venue: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isOnline: z.boolean().default(false),
  onlineLink: z.string().url().optional().or(z.literal("")),
  capacity: z.number().int().positive().optional(),
  waitlistEnabled: z.boolean().default(false),
  isFree: z.boolean().default(true),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  tagNames: z.array(z.string()).optional(),
})

export const createEventSchema = baseEventFields.refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end > start
}, {
  message: "End date must be after start date",
  path: ["endDate"],
})

export const updateEventSchema = baseEventFields.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
