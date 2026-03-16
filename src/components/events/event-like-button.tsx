"use client"

import { useTransition, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleLike } from "@/server/actions/like.actions"
import { toast } from "sonner"

interface EventLikeButtonProps {
  eventId: string
  isLiked: boolean
  likeCount: number
}

export function EventLikeButton({ eventId, isLiked: initial, likeCount }: EventLikeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(
    { liked: initial, count: likeCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: newLiked ? state.count + 1 : state.count - 1,
    })
  )

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticState(!optimisticState.liked)
      const result = await toggleLike(eventId)
      if (result.error) {
        toast.error(result.error)
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
      <Heart
        className={`h-4 w-4 ${optimisticState.liked ? "fill-red-500 text-red-500" : ""}`}
      />
      {optimisticState.count}
    </Button>
  )
}
