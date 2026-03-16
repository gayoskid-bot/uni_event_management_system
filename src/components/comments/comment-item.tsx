"use client"

import { useState, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Reply, Trash2, Loader2 } from "lucide-react"
import { CommentForm } from "./comment-form"
import { deleteComment } from "@/server/actions/comment.actions"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"

interface CommentUser {
  id: string
  name: string | null
  image: string | null
}

interface CommentData {
  id: string
  content: string
  createdAt: Date
  user: CommentUser
  replies?: CommentData[]
}

interface CommentItemProps {
  comment: CommentData
  currentUserId?: string
  eventId: string
  isReply?: boolean
}

export function CommentItem({ comment, currentUserId, eventId, isReply }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false)
  const [isDeleting, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteComment(comment.id)
      if (result.error) toast.error(result.error)
      else toast.success("Comment deleted")
    })
  }

  const timeAgo = getTimeAgo(comment.createdAt)

  return (
    <div className={`${isReply ? "ml-10 mt-3" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.user.image || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.user.name || "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-2 mt-2">
            {!isReply && currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowReply(!showReply)}
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            )}
            {currentUserId === comment.user.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReply && (
        <div className="ml-10 mt-3">
          <CommentForm
            eventId={eventId}
            parentId={comment.id}
            onCancel={() => setShowReply(false)}
            placeholder={`Reply to ${comment.user.name}...`}
          />
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          eventId={eventId}
          isReply
        />
      ))}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}
