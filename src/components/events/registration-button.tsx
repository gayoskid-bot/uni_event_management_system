"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Clock } from "lucide-react"
import { registerForEvent, cancelRegistration } from "@/server/actions/registration.actions"
import { toast } from "sonner"

interface RegistrationButtonProps {
  eventId: string
  isFree: boolean
  isFull: boolean
  waitlistEnabled: boolean
  registration?: {
    status: string
  } | null
}

export function RegistrationButton({
  eventId,
  isFree,
  isFull,
  waitlistEnabled,
  registration,
}: RegistrationButtonProps) {
  const [isPending, startTransition] = useTransition()

  const isRegistered = registration?.status === "CONFIRMED" || registration?.status === "CHECKED_IN"
  const isWaitlisted = registration?.status === "WAITLISTED"

  const handleRegister = () => {
    startTransition(async () => {
      const result = await registerForEvent(eventId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.status === "CONFIRMED") {
        toast.success("You're registered! Check your email for confirmation.")
      } else if (result.status === "WAITLISTED") {
        toast.info("You've been added to the waitlist.")
      }
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelRegistration(eventId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Registration cancelled.")
      }
    })
  }

  if (isRegistered) {
    return (
      <div className="space-y-2">
        <Button className="w-full" variant="outline" disabled>
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
          Registered
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleCancel}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Cancel Registration
        </Button>
      </div>
    )
  }

  if (isWaitlisted) {
    return (
      <div className="space-y-2">
        <Button className="w-full" variant="outline" disabled>
          <Clock className="mr-2 h-4 w-4 text-yellow-600" />
          On Waitlist
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleCancel}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Leave Waitlist
        </Button>
      </div>
    )
  }

  if (isFull && !waitlistEnabled) {
    return (
      <Button className="w-full" size="lg" disabled>
        Event Full
      </Button>
    )
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleRegister}
      disabled={isPending}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isFull && waitlistEnabled
        ? "Join Waitlist"
        : isFree
        ? "Register Now"
        : "Get Tickets"}
    </Button>
  )
}
