"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useCallback, useTransition } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { useEffect } from "react"

export function EventSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(searchParams.get("search") || "")
  const debouncedQuery = useDebounce(query, 400)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete("page") // Reset page on new search
      return params.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("search", debouncedQuery)}`)
    })
  }, [debouncedQuery, router, pathname, createQueryString])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search events by title, description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      )}
    </div>
  )
}
