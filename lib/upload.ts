import toast from "react-hot-toast"

import { API_URL } from "@/lib/constants"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

export async function uploadImage(file: File, isPublic = false): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error("Please choose a JPG, PNG or WebP image.")
    return null
  }
  if (file.size > MAX_SIZE) {
    toast.error("Image must be 5 MB or smaller.")
    return null
  }

  const form = new FormData()
  form.append("image", file)

  try {
    const response = await fetch(`${API_URL}/api/upload/${isPublic ? "public" : "image"}`, {
      method: "POST",
      body: form,
    })
    const payload = (await response.json().catch(() => ({}))) as {
      success?: boolean
      url?: string
      message?: string
    }
    if (!response.ok || !payload.url) {
      throw new Error(payload.message ?? "Image upload failed.")
    }
    return payload.url
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Image upload failed.")
    return null
  }
}
