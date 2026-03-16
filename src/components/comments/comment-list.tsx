import { getEventComments } from "@/server/actions/comment.actions"
import { CommentItem } from "./comment-item"
import { CommentForm } from "./comment-form"
import { auth } from "@/server/auth"
import { MessageSquare } from "lucide-react"

interface CommentListProps {
  eventId: string
}

export async function CommentList({ eventId }: CommentListProps) {
  const [comments, session] = await Promise.all([
    getEventComments(eventId),
    auth(),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h2>

      {session?.user && (
        <CommentForm eventId={eventId} />
      )}

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id}
              eventId={eventId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
