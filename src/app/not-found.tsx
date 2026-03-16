import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <CalendarDays className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-xl font-medium mb-4">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/events">
          <Button variant="outline">Browse Events</Button>
        </Link>
      </div>
    </div>
  )
}
