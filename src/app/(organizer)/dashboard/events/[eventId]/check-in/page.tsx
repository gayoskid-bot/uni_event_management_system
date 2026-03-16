"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { processCheckIn } from "@/server/actions/check-in.actions"
import { QrCode, CheckCircle, XCircle, Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { use } from "react"

interface CheckInPageProps {
  params: Promise<{ eventId: string }>
}

export default function CheckInPage({ params }: CheckInPageProps) {
  const { eventId } = use(params)
  const [qrInput, setQrInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [lastResult, setLastResult] = useState<{
    success?: boolean
    error?: string
    attendee?: { name: string | null; email: string }
  } | null>(null)
  const [checkedInCount, setCheckedInCount] = useState(0)

  const handleCheckIn = () => {
    if (!qrInput.trim()) return
    startTransition(async () => {
      const result = await processCheckIn(qrInput.trim(), eventId)
      setLastResult(result)
      if (result.success) {
        setCheckedInCount((c) => c + 1)
        toast.success(`${result.attendee?.name} checked in!`)
        setQrInput("")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Check-In</h1>
        <p className="text-muted-foreground mt-1">
          Scan QR codes or enter them manually
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{checkedInCount}</div>
            <div className="text-xs text-muted-foreground">Checked in this session</div>
          </CardContent>
        </Card>
      </div>

      {/* QR Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Enter QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Paste or scan QR code..."
              onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
              autoFocus
            />
            <Button onClick={handleCheckIn} disabled={isPending || !qrInput.trim()}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div
              className={`flex items-center gap-3 rounded-lg p-4 ${
                lastResult.success
                  ? "bg-green-50 border-green-200 border"
                  : "bg-red-50 border-red-200 border"
              }`}
            >
              {lastResult.success ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">
                      {lastResult.attendee?.name}
                    </p>
                    <p className="text-sm text-green-700">
                      {lastResult.attendee?.email}
                    </p>
                    <Badge className="mt-1 bg-green-100 text-green-800">
                      Checked In
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-red-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800">Check-in Failed</p>
                    <p className="text-sm text-red-700">{lastResult.error}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Tip: On mobile, use your camera app to scan QR codes and paste the result here.
      </p>
    </div>
  )
}
