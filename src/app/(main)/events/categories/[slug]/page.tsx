import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { EventGrid } from "@/components/events/event-grid"
import { EventPagination } from "@/components/events/event-pagination"
import { getEvents, getCategoryBySlug } from "@/server/queries/events.queries"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Category Not Found" }
  return {
    title: `${category.name} Events`,
    description: category.description || `Browse ${category.name} events on campus`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageStr } = await searchParams
  const page = Number(pageStr) || 1

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const { events, total, totalPages } = await getEvents({
    categorySlug: slug,
    page,
    limit: 12,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Events
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {category.color && (
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          )}
          <h1 className="text-3xl font-bold">{category.name} Events</h1>
        </div>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {total} event{total !== 1 ? "s" : ""}
        </p>
      </div>

      <EventGrid
        events={events}
        emptyMessage={`No ${category.name.toLowerCase()} events yet`}
      />

      {totalPages > 1 && (
        <EventPagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  )
}
