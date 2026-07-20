"use client"

import { useRef, useState } from "react"
import { Link2, Upload, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/server/actions/upload.actions"
import { cn } from "@/lib/utils"

type Mode = "url" | "upload"

export function ImageUploadField({
  name,
  label,
  defaultValue,
  folder = "uploads",
  round = false,
}: {
  name: string
  label: string
  defaultValue?: string | null
  folder?: string
  round?: boolean
}) {
  const [value, setValue] = useState(defaultValue ?? "")
  const [mode, setMode] = useState<Mode>("url")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    const result = await uploadImage(formData)

    setUploading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.url) {
      setValue(result.url)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex rounded-md border p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 transition-colors",
              mode === "url" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
            )}
          >
            <Link2 className="h-3 w-3" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 transition-colors",
              mode === "upload" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
            )}
          >
            <Upload className="h-3 w-3" />
            Upload
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={value} />

      {mode === "url" ? (
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Choose Image"}
          </Button>
          <span className="ml-2 text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF, up to 5MB</span>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className={cn(
              "h-20 w-20 border object-cover",
              round ? "rounded-full" : "rounded-lg"
            )}
            onError={() => setError("Couldn't load image from that URL")}
          />
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
