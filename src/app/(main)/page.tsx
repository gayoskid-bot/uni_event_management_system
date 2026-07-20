import Link from "next/link"
import { ArrowRight, CalendarDays, Search, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventGrid } from "@/components/events/event-grid"
import { CategoryIcon } from "@/components/categories/category-icon"
import { getUpcomingEvents, getTrendingEvents, getCategories } from "@/server/queries/events.queries"

export default async function HomePage() {
  const [upcomingEvents, trendingEvents, categories] = await Promise.all([
    getUpcomingEvents(6),
    getTrendingEvents(6),
    getCategories(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Your Campus, Your Events
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover & Manage{" "}
              <span className="text-primary">University Events</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Find academic seminars, social gatherings, sports events, and more.
              Connect with your campus community and never miss an event.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/events">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Search className="h-4 w-4" />
                  Explore Events
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
            {[
              { icon: CalendarDays, label: "Events", value: "100+" },
              { icon: Users, label: "Students", value: "1,000+" },
              { icon: MapPin, label: "Venues", value: "50+" },
              { icon: Search, label: "Categories", value: `${categories.length}` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-6 w-6 mx-auto text-primary mb-1" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-1">Find events that match your interests</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/events/categories/${category.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:shadow-md hover:border-primary/30"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <CategoryIcon
                  name={category.icon}
                  className="h-5 w-5"
                  style={{ color: category.color || undefined }}
                />
              </div>
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs text-muted-foreground">
                {category._count.events} events
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <p className="text-muted-foreground mt-1">Don&apos;t miss what&apos;s happening next</p>
          </div>
          <Link href="/events">
            <Button variant="ghost" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <EventGrid events={upcomingEvents} emptyMessage="No upcoming events yet" />
      </section>

      {/* Trending Events */}
      {trendingEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <p className="text-muted-foreground mt-1">Most popular events on campus</p>
            </div>
            <Link href="/events">
              <Button variant="ghost" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <EventGrid events={trendingEvents} />
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary/5 border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to organize an event?</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Create and manage events with powerful tools. Track registrations,
            send announcements, and analyze your event performance.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">
                Start Organizing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
