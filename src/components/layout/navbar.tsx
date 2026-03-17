"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  CalendarDays,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  LayoutDashboard,
  LogOut,
  User,
  Settings,
  Bookmark,
  Shield,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { logout } from "@/server/actions/auth.actions"

interface NavbarProps {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  } | null
}

const navLinks = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/events/calendar", label: "Calendar" },
  { href: "/events/map", label: "Map" },
]

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN"
  const isAdmin = user?.role === "ADMIN"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">UniEvents</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Link href="/events" className="hidden sm:flex">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <>
              {isOrganizer && (
                <Link href="/dashboard/events/new" className="hidden sm:flex">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              )}

              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center"
                >
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg z-50">
                      <div className="px-3 py-2 border-b mb-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href="/my-dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <Home className="h-4 w-4" />
                        My Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/bookmarks"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <Bookmark className="h-4 w-4" />
                        Saved Events
                      </Link>
                      {isOrganizer && (
                        <Link
                          href="/dashboard/events"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Organizer Dashboard
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/profile/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="border-t mt-1 pt-1">
                        <form action={logout}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isOrganizer && (
              <Link
                href="/dashboard/events/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-accent"
              >
                + Create Event
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
