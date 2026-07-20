import { CalendarDays } from "lucide-react"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mb-8 flex items-center gap-2">
        <CalendarDays className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">UniEvents</span>
      </div>
      <div className="w-full max-w-xl">{children}</div>
    </div>
  )
}
