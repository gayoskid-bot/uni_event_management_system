"use client"

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "./star-rating"
import { createReview } from "@/server/actions/review.actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormProps {
  eventId: string
}

export function ReviewForm({ eventId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (formData: FormData) => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    formData.set("rating", String(rating))
    startTransition(async () => {
      const result = await createReview(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Review submitted!")
        formRef.current?.reset()
        setRating(0)
      }
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <input type="hidden" name="eventId" value={eventId} />
      <div>
        <p className="text-sm font-medium mb-2">Your Rating</p>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <Textarea
        name="content"
        placeholder="Share your experience (optional)"
        rows={3}
        className="resize-none"
      />
      <Button type="submit" size="sm" disabled={isPending || rating === 0}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </form>
  )
}
