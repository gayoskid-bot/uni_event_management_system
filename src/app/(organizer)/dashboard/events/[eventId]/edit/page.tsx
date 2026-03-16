import { notFound, redirect } from "next/navigation"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { getCategories } from "@/server/queries/events.queries"
import { EventForm } from "@/components/events/event-form"

interface EditEventPageProps {
  params: Promise<{ eventId: string }>
}

export const metadata = { title: "Edit Event" }

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { eventId } = await params

  const [event, categories] = await Promise.all([
    db.event.findUnique({
      where: { id: eventId },
      include: { categories: { select: { categoryId: true } } },
    }),
    getCategories(),
  ])

  if (!event) notFound()
  if (event.organizerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard/events")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground mt-1">Update your event details</p>
      </div>
      <EventForm categories={categories} event={event} />
    </div>
  )
}
