import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ComingSoon({
  title,
  backHref = "/",
  backLabel = "Go Home",
}: {
  title: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-sm">
        You&apos;re right on time — this feature is coming soon. Stay tuned!
      </p>
      <Link href={backHref} className="mt-6">
        <Button>{backLabel}</Button>
      </Link>
    </div>
  )
}
