"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onChange?: (rating: number) => void
}

const sizeMap = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" }

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < rating
        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
