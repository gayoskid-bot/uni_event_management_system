import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  CalendarDays,
  LayoutDashboard,
  CalendarPlus,
  BarChart3,
  Settings,
  ChevronLeft,
} from "lucide-react"
import { SidebarNav } from "@/components/layout/sidebar-nav"

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ORGANIZER" && session.user.role !== "ADMIN") {
    redirect("/")
  }

  const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/events", label: "My Events", icon: CalendarDays },
    { href: "/dashboard/events/new", label: "Create Event", icon: CalendarPlus },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="font-bold">UniEvents</span>
        </div>
        <SidebarNav links={sidebarLinks} />
        <div className="border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center border-b px-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span className="font-bold">UniEvents Dashboard</span>
          </Link>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
