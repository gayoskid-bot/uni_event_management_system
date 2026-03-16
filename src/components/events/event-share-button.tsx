"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface EventShareButtonProps {
  title: string
  slug: string
}

export function EventShareButton({ title, slug }: EventShareButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/events/${slug}`

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
    }
  }

  return (
    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  )
}
