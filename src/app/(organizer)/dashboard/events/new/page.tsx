import { EventForm } from "@/components/events/event-form"
import { getCategories } from "@/server/queries/events.queries"

export const metadata = {
  title: "Create Event",
}

export default async function CreateEventPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details to create your event
        </p>
      </div>
      <EventForm categories={categories} />
    </div>
  )
}
