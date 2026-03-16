"use client"

import { useActionState } from "react"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createAnnouncement } from "@/server/actions/announcement.actions"
import { Loader2, Megaphone, Send } from "lucide-react"
import { toast } from "sonner"

interface AnnouncementsPageProps {
  params: Promise<{ eventId: string }>
}

export default function AnnouncementsPage({ params }: AnnouncementsPageProps) {
  const { eventId } = use(params)

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean; count?: number } | undefined, formData: FormData) => {
      formData.set("eventId", eventId)
      const result = await createAnnouncement(formData)
      if (result.success) {
        toast.success(`Announcement sent to ${result.count} attendees!`)
      }
      return result
    },
    undefined
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-7 w-7" />
          Announcements
        </h1>
        <p className="text-muted-foreground mt-1">
          Send announcements to all registered attendees
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Announcement title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your announcement..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Announcement
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
