import { getEventReviews, getEventAverageRating } from "@/server/actions/review.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "./star-rating"
import { ReviewForm } from "./review-form"
import { getInitials, formatDate } from "@/lib/utils"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { Star } from "lucide-react"

interface ReviewListProps {
  eventId: string
  eventStatus: string
}

export async function ReviewList({ eventId, eventStatus }: ReviewListProps) {
  const [reviews, { average, count }, session] = await Promise.all([
    getEventReviews(eventId),
    getEventAverageRating(eventId),
    auth(),
  ])

  const isCompleted = eventStatus === "COMPLETED"

  // Check if user can review
  let canReview = false
  if (session?.user && isCompleted) {
    const [registration, existingReview] = await Promise.all([
      db.registration.findUnique({
        where: { eventId_userId: { eventId, userId: session.user.id } },
      }),
      db.review.findUnique({
        where: { userId_eventId: { userId: session.user.id, eventId } },
      }),
    ])
    canReview = !!registration && registration.status !== "CANCELLED" && !existingReview
  }

  if (!isCompleted && reviews.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5" />
          Reviews
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(average)} size="sm" />
            <span className="text-sm text-muted-foreground">
              {average.toFixed(1)} ({count} review{count !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {canReview && <ReviewForm eventId={eventId} />}

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3 border-b pb-4 last:border-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.image || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(review.user.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{review.user.name}</span>
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.content && (
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
