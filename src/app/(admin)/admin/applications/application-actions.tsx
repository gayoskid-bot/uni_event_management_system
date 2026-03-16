"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { approveOrganizerApplication, rejectOrganizerApplication } from "@/server/actions/admin.actions"
import { toast } from "sonner"
import { Check, X, Loader2 } from "lucide-react"

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveOrganizerApplication(applicationId)
      if (result.success) toast.success("Application approved!")
      else toast.error(result.error)
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectOrganizerApplication(applicationId)
      if (result.success) toast.success("Application rejected")
      else if ("error" in result) toast.error(result.error as string)
    })
  }

  return (
    <div className="flex gap-1 shrink-0">
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      <Button size="sm" onClick={handleApprove} disabled={isPending} className="gap-1">
        <Check className="h-3.5 w-3.5" /> Approve
      </Button>
      <Button size="sm" variant="outline" onClick={handleReject} disabled={isPending} className="gap-1">
        <X className="h-3.5 w-3.5" /> Reject
      </Button>
    </div>
  )
}
