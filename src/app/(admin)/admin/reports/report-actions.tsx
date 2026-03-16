"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { resolveReport } from "@/server/actions/admin.actions"
import { toast } from "sonner"
import { Check, Loader2 } from "lucide-react"

export function ReportActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleResolve = () => {
    startTransition(async () => {
      const result = await resolveReport(reportId)
      if (result.success) toast.success("Report resolved")
    })
  }

  return (
    <Button size="sm" onClick={handleResolve} disabled={isPending} className="gap-1 shrink-0">
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      Resolve
    </Button>
  )
}
