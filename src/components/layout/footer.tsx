import Link from "next/link"
import { CalendarDays } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">UniEvents</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover and manage university events. Connect with your campus community.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Discover</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/events" className="hover:text-foreground transition-colors">All Events</Link></li>
              <li><Link href="/events/calendar" className="hover:text-foreground transition-colors">Calendar</Link></li>
              <li><Link href="/events/map" className="hover:text-foreground transition-colors">Campus Map</Link></li>
              <li><Link href="/events/categories/academic" className="hover:text-foreground transition-colors">Academic</Link></li>
              <li><Link href="/events/categories/social" className="hover:text-foreground transition-colors">Social</Link></li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h3 className="text-sm font-semibold mb-3">For Organizers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/events/new" className="hover:text-foreground transition-colors">Create Event</Link></li>
              <li><Link href="/dashboard/analytics" className="hover:text-foreground transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UniEvents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
