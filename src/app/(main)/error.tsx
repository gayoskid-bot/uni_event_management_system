"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        An error occurred while loading this page. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
