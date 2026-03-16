"use client"

import { useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { createComment } from "@/server/actions/comment.actions"
import { toast } from "sonner"

interface CommentFormProps {
  eventId: string
  parentId?: string
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({
  eventId,
  parentId,
  onCancel,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createComment(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        formRef.current?.reset()
        onCancel?.()
        toast.success("Comment posted!")
      }
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <Textarea
        name="content"
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        required
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isPending} className="gap-1">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  )
}
