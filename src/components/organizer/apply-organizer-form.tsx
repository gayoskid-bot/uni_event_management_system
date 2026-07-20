"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { applyForOrganizer } from "@/server/actions/organizer-application.actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ApplyOrganizerForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      const result = await applyForOrganizer(formData)
      if (result.success) toast.success("Application submitted!")
      return result
    },
    undefined
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="organization">Department / Society (optional)</Label>
            <Input
              id="organization"
              name="organization"
              placeholder="e.g., Computer Science Department, Debate Society"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Why do you want to become an organizer? *</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={5}
              placeholder="Tell us what kind of events you'd like to organize and why"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
