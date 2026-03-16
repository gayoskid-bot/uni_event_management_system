import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EventGrid } from "@/components/events/event-grid"
import { EventSearch } from "@/components/events/event-search"
import { EventFilters } from "@/components/events/event-filters"
import { EventPagination } from "@/components/events/event-pagination"
import { getEvents, getCategories } from "@/server/queries/events.queries"

interface EventsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    free?: string
    from?: string
    to?: string
    page?: string
  }>
}

export const metadata = {
  title: "Events",
  description: "Browse and discover university events",
}

async function EventsContent({ searchParams }: { searchParams: EventsPageProps["searchParams"] }) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const { events, total, totalPages } = await getEvents({
    search: params.search,
    categorySlug: params.category,
    isFree: params.free === "true" ? true : params.free === "false" ? false : undefined,
    fromDate: params.from,
    toDate: params.to,
    page,
    limit: 12,
  })

  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        {total} event{total !== 1 ? "s" : ""} found
      </p>

      <EventGrid events={events} emptyMessage="No events match your filters" />

      {totalPages > 1 && (
        <EventPagination currentPage={page} totalPages={totalPages} />
      )}
    </>
  )
}

export default async function EventsPage(props: EventsPageProps) {
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground mt-1">
          Discover what&apos;s happening on campus
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-20">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <EventFilters categories={categories} />
            </Suspense>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <EventSearch />
            </Suspense>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[16/9] rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            }
          >
            <EventsContent searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
