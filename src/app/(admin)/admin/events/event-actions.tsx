"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  approveEvent,
  rejectEvent,
  archiveEvent,
  restoreEvent,
  deleteEventAdmin,
  archiveExpiredEvents,
} from "@/server/actions/admin.actions"
import { Check, X, Archive, RotateCcw, Trash2, Clock } from "lucide-react"

export function ApproveButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
      disabled={pending}
      onClick={() => startTransition(async () => { await approveEvent(eventId) })}
    >
      <Check className="h-3 w-3" />
      Approve
    </Button>
  )
}

export function RejectButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      disabled={pending}
      onClick={() => startTransition(async () => { await rejectEvent(eventId) })}
    >
      <X className="h-3 w-3" />
      Reject
    </Button>
  )
}

export function ArchiveButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1"
      disabled={pending}
      onClick={() => startTransition(async () => { await archiveEvent(eventId) })}
    >
      <Archive className="h-3 w-3" />
      Archive
    </Button>
  )
}

export function RestoreButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      disabled={pending}
      onClick={() => startTransition(async () => { await restoreEvent(eventId) })}
    >
      <RotateCcw className="h-3 w-3" />
      Restore
    </Button>
  )
}

export function DeleteButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
      disabled={pending}
      onClick={() => {
        if (confirm("Are you sure you want to permanently delete this event?")) {
          startTransition(async () => { await deleteEventAdmin(eventId) })
        }
      }}
    >
      <Trash2 className="h-3 w-3" />
      Delete
    </Button>
  )
}

export function ArchiveExpiredButton() {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1"
      disabled={pending}
      onClick={() => startTransition(async () => { await archiveExpiredEvents() })}
    >
      <Clock className="h-4 w-4" />
      {pending ? "Archiving..." : "Archive Expired Events"}
    </Button>
  )
}
