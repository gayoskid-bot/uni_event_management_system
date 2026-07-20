import { auth } from "@/server/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, ChevronLeft } from "lucide-react"
import { SidebarNav, type SidebarLink } from "@/components/layout/sidebar-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const links: SidebarLink[] = [
    { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
    { href: "/admin/users", label: "Users", icon: "Users" },
    { href: "/admin/events", label: "Events", icon: "CalendarDays" },
    { href: "/admin/applications", label: "Applications", icon: "ClipboardCheck" },
    { href: "/admin/reports", label: "Reports", icon: "Flag" },
    { href: "/admin/categories", label: "Categories", icon: "Tag" },
    { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  ]

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <SidebarNav links={links} />
        <div className="border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-16 items-center border-b px-6 lg:hidden">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold">Admin Panel</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
