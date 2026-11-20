"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { AuthDivider } from "@/components/auth/auth-divider"
import { AuthField } from "@/components/auth/auth-field"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { signUp } from "@/lib/auth-client"
import { AUTH_MESSAGES, ROUTES } from "@/lib/constants"
import { getMissingPasswordRules, validateEmail, validateImageUrl, validateRequired } from "@/lib/validation"
import { uploadImage } from "@/lib/upload"

type FieldErrors = { name?: string; email?: string; password?: string; image?: string }
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function SignUpForm() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [imageMode, setImageMode] = useState<"url" | "upload">("url")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (user) router.replace(ROUTES.callback)
  }, [user, router])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const missingRules = getMissingPasswordRules(password)

  if (user) return null

  function switchMode(mode: "url" | "upload") {
    setImageMode(mode)
    if (mode === "url") setImagePreview(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || uploading) return

    const form = new FormData(event.currentTarget)
    const values = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      image: String(form.get("image") ?? "").trim(),
    }
    const file = form.get("file")
    const imageFile = file instanceof File && file.size > 0 ? file : null

    const nextErrors: FieldErrors = {
      name: validateRequired(values.name, "Full name") ?? undefined,
      email: validateEmail(values.email) ?? undefined,
      password: missingRules.length
        ? `Password needs ${missingRules.join(", ")}.`
        : undefined,
      image:
        imageMode === "url" && imageFile === null
          ? validateImageUrl(values.image) ?? undefined
          : undefined,
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setIsSubmitting(true)
    setFormError(null)

    let image = values.image
    if (imageMode === "upload" && imageFile) {
      setUploading(true)
      const uploaded = await uploadImage(imageFile, true)
      setUploading(false)
      if (!uploaded) {
        setIsSubmitting(false)
        return
      }
      image = uploaded
    }

    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      image,
      callbackURL: ROUTES.callback,
    })

    setIsSubmitting(false)
    if (error) {
      const message = getAuthErrorMessage(error, AUTH_MESSAGES.signUpError)
      setFormError(message)
      toast.error(message)
      return
    }

    toast.success(AUTH_MESSAGES.signUpSuccess)
    router.push(ROUTES.callback)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField id="signup-name" name="name" label="Full Name" placeholder="Your name" autoComplete="name" error={errors.name} />
        <AuthField id="signup-email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" error={errors.email} />
        <AuthField
          id="signup-password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="new-password"
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <ul className="space-y-1 rounded-xl bg-base-200 p-3 text-sm">
          {[
            { label: "6+ characters", ok: password.length >= 6 },
            { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
            { label: "One lowercase letter", ok: /[a-z]/.test(password) },
          ].map((rule) => (
            <li key={rule.label} className={rule.ok ? "text-success" : "text-base-content/60"}>
              {rule.ok ? "✓" : "○"} {rule.label}
            </li>
          ))}
        </ul>

        <div>
          <span className="mb-1 block text-sm font-medium">Profile Image</span>
          <div className="mb-2 flex gap-2" role="group" aria-label="Image source">
            {(["url", "upload"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={imageMode === mode ? "primary" : "outline"}
                onClick={() => switchMode(mode)}
              >
                {mode === "url" ? "Image URL" : "Upload"}
              </Button>
            ))}
          </div>

          {imageMode === "url" ? (
            <AuthField
              id="signup-image"
              name="image"
              type="url"
              label="Image URL (optional)"
              placeholder="https://..."
              error={errors.image}
            />
          ) : (
            <input
              id="signup-file"
              name="file"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              aria-label="Profile image file"
              onChange={(event) => {
                const file = event.target.files?.[0]
                setImagePreview(file ? URL.createObjectURL(file) : null)
              }}
              className="min-h-11 w-full rounded-xl border border-base-300 p-2 text-sm"
            />
          )}

          {imagePreview && (
            <Image src={imagePreview} alt="Selected profile preview" width={64} height={64} className="mt-2 rounded-xl object-cover" unoptimized />
          )}
        </div>

        <AuthFormError message={formError} />

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting || uploading} loading={isSubmitting || uploading}>
          {uploading ? "Uploading image..." : isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton label="Continue with Google" disabled={isSubmitting || uploading} />
    </div>
  )
}
