import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/server/auth"
import { getUserBookmarkedEvents } from "@/server/queries/events.queries"
import { EventGrid } from "@/components/events/event-grid"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"

export const metadata = {
  title: "Saved Events",
}

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/bookmarks")

  const events = await getUserBookmarkedEvents(session.user.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Events</h1>
        <p className="text-muted-foreground mt-1">
          Events you&apos;ve bookmarked for later
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No saved events</h3>
          <p className="text-muted-foreground mt-1">
            Click the bookmark icon on any event to save it here
          </p>
          <Link href="/events" className="mt-4 inline-block">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <EventGrid events={events} />
      )}
    </div>
  )
}
