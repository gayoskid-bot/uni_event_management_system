"use client"

import { useEffect, useState } from "react"
import { generateQRCodeDataURL } from "@/lib/qr"

interface QRCodeDisplayProps {
  data: string
  size?: number
}

export function QRCodeDisplay({ data, size = 200 }: QRCodeDisplayProps) {
  const [src, setSrc] = useState<string>("")

  useEffect(() => {
    generateQRCodeDataURL(data).then(setSrc)
  }, [data])

  if (!src) {
    return (
      <div
        className="animate-pulse bg-muted rounded"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded"
    />
  )
}
