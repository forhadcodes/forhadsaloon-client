"use client"

import { useState } from "react"

import { AuthDivider } from "@/components/auth/auth-divider"
import { AuthField } from "@/components/auth/auth-field"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import type { SignUpInput } from "@/lib/types"
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from "@/lib/validation"

type FieldErrors = Partial<Record<keyof SignUpInput, string>>

/** Optional image URL: empty is fine, otherwise it must be a real link. */
function validateImage(value: string) {
  if (!value) return null

  try {
    new URL(value)
    return null
  } catch {
    return "Enter a valid image URL."
  }
}

export function SignUpForm() {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [collected, setCollected] = useState<SignUpInput | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const values: SignUpInput = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      image: String(formData.get("image") ?? "").trim() || undefined,
    }

    const nextErrors: FieldErrors = {
      name: validateRequired(values.name, "Full name") ?? undefined,
      email: validateEmail(values.email) ?? undefined,
      password: validatePassword(values.password) ?? undefined,
      image: validateImage(values.image ?? "") ?? undefined,
    }
    const hasErrors = Object.values(nextErrors).some(Boolean)

    setErrors(nextErrors)
    if (hasErrors) {
      setCollected(null)
      return
    }

    // TODO: swap for authClient.signUp.email(values) once the auth API is ready.
    console.info("[sign-up] collected form data", values)
    setCollected(values)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="signup-name"
          name="name"
          label="Full Name"
          placeholder="Forhad Hussain"
          autoComplete="name"
          error={errors.name}
        />
        <AuthField
          id="signup-email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthField
          id="signup-password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password}
          hint="At least 6 characters, with one uppercase and one lowercase letter."
        />
        <AuthField
          id="signup-image"
          name="image"
          type="url"
          label="Profile Image URL"
          placeholder="https://example.com/photo.jpg"
          error={errors.image}
          hint="Optional. Image upload will be added with ImgBB."
        />

        <Button type="submit" variant="brand" size="lg" className="h-11 w-full">
          Create Account
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton label="Sign up with Google" />

      {collected ? (
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Form data collected for <strong>{collected.name}</strong> (
          {collected.email}). Connect the auth API to create the account.
        </p>
      ) : null}
    </div>
  )
}
