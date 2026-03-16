"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { X, SlidersHorizontal } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  _count: { events: number }
}

interface EventFiltersProps {
  categories: Category[]
}

export function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeCategory = searchParams.get("category")
  const activeFree = searchParams.get("free")
  const activeFromDate = searchParams.get("from")
  const activeToDate = searchParams.get("to")

  const hasActiveFilters = activeCategory || activeFree || activeFromDate || activeToDate

  const updateParam = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete("page")
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, router, pathname]
  )

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams()
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [searchParams, router, pathname])

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active:</span>
          {activeCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              <button onClick={() => updateParam("category", null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFree === "true" && (
            <Badge variant="secondary" className="gap-1">
              Free
              <button onClick={() => updateParam("free", null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFree === "false" && (
            <Badge variant="secondary" className="gap-1">
              Paid
              <button onClick={() => updateParam("free", null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeFromDate && (
            <Badge variant="secondary" className="gap-1">
              From: {activeFromDate}
              <button onClick={() => updateParam("from", null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeToDate && (
            <Badge variant="secondary" className="gap-1">
              To: {activeToDate}
              <button onClick={() => updateParam("to", null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Price</h3>
        <div className="flex gap-2">
          <Button
            variant={!activeFree ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("free", null)}
          >
            All
          </Button>
          <Button
            variant={activeFree === "true" ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("free", "true")}
          >
            Free
          </Button>
          <Button
            variant={activeFree === "false" ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("free", "false")}
          >
            Paid
          </Button>
        </div>
      </div>

      <Separator />

      {/* Date Filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Date Range</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="from" className="text-xs">From</Label>
            <Input
              id="from"
              type="date"
              value={activeFromDate || ""}
              onChange={(e) => updateParam("from", e.target.value || null)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to" className="text-xs">To</Label>
            <Input
              id="to"
              type="date"
              value={activeToDate || ""}
              onChange={(e) => updateParam("to", e.target.value || null)}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Categories</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                updateParam(
                  "category",
                  activeCategory === category.slug ? null : category.slug
                )
              }
              className={`flex items-center justify-between w-full rounded-md px-3 py-2 text-sm transition-colors ${
                activeCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color || "#888" }}
                />
                <span>{category.name}</span>
              </div>
              <span className="text-xs opacity-60">{category._count.events}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
