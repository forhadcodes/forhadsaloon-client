import toast from "react-hot-toast"

import { getAuthToken } from "@/lib/api"
import { API_URL } from "@/lib/constants"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

/**
 * Sends an image to the Express server, which forwards it to ImgBB.
 * The dashboard endpoint needs the JWT; the sign-up endpoint is public.
 */
export async function uploadImage(file: File, isPublic = false): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error("Please choose a JPG, PNG or WebP image.")
    return null
  }
  if (file.size > MAX_SIZE) {
    toast.error("Image must be 5 MB or smaller.")
    return null
  }

  const headers: Record<string, string> = {}
  if (!isPublic) {
    const token = await getAuthToken()
    if (!token) {
      toast.error("Please sign in again to upload images.")
      return null
    }
    headers.Authorization = `Bearer ${token}`
  }

  const form = new FormData()
  form.append("image", file)

  let response: Response
  try {
    response = await fetch(`${API_URL}/api/upload/${isPublic ? "public" : "image"}`, {
      method: "POST",
      body: form,
      headers,
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    toast.error("Unable to reach the upload service. Please try again.")
    return null
  }

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean
    url?: string
    message?: string
    data?: { url?: string }
  }
  const url = payload.data?.url ?? payload.url

  if (!response.ok || !url) {
    toast.error(payload.message ?? "Image upload failed.")
    return null
  }

  return url
}
