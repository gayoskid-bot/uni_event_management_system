"use client"

import { useTransition, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { toggleFollow } from "@/server/actions/follow.actions"
import { toast } from "sonner"

interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
}

export function FollowButton({ targetUserId, isFollowing: initial }: FollowButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(initial)

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing)
      const result = await toggleFollow(targetUserId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.following) {
        toast.success("Following!")
      }
    })
  }

  return (
    <Button
      variant={optimisticFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : optimisticFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {optimisticFollowing ? "Following" : "Follow"}
    </Button>
  )
}
