"use client"

import { useTransition, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { toggleBookmark } from "@/server/actions/bookmark.actions"
import { toast } from "sonner"

interface EventBookmarkButtonProps {
  eventId: string
  isBookmarked: boolean
}

export function EventBookmarkButton({ eventId, isBookmarked: initial }: EventBookmarkButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(initial)

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticBookmarked(!optimisticBookmarked)
      const result = await toggleBookmark(eventId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.bookmarked) {
        toast.success("Event saved!")
      } else {
        toast.success("Event unsaved.")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex-1 gap-1"
      onClick={handleToggle}
      disabled={isPending}
    >
      <Bookmark
        className={`h-4 w-4 ${optimisticBookmarked ? "fill-current" : ""}`}
      />
      {optimisticBookmarked ? "Saved" : "Save"}
    </Button>
  )
}
