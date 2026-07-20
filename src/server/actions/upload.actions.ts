"use server"

import { put } from "@vercel/blob"
import { auth } from "@/server/auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function uploadImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: "You must be logged in to upload images" }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided" }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Image must be smaller than 5MB" }
  }

  const folder = (formData.get("folder") as string) || "uploads"
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")

  try {
    const blob = await put(`${folder}/${session.user.id}/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
    })
    return { url: blob.url }
  } catch {
    return { error: "Upload failed. Please try again." }
  }
}
