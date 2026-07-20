"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  Flag,
  Tag,
  BarChart3,
  CalendarPlus,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SIDEBAR_ICONS = {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  Flag,
  Tag,
  BarChart3,
  CalendarPlus,
  Settings,
} satisfies Record<string, LucideIcon>

export type SidebarIconName = keyof typeof SIDEBAR_ICONS

export type SidebarLink = {
  href: string
  label: string
  icon: SidebarIconName
}

export function SidebarNav({ links }: { links: SidebarLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 p-4">
      {links.map((link) => {
        const isActive =
          link.href === "/admin" || link.href === "/dashboard"
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`)

        const Icon = SIDEBAR_ICONS[link.icon]

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
