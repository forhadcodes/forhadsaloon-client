"use client"

import { useState } from "react"

import { AuthDivider } from "@/components/auth/auth-divider"
import { AuthField } from "@/components/auth/auth-field"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import type { SignInInput } from "@/lib/types"
import { validateEmail, validateRequired } from "@/lib/validation"

type FieldErrors = Partial<Record<keyof SignInInput, string>>

export function SignInForm() {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [collected, setCollected] = useState<SignInInput | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const values: SignInInput = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    }

    const nextErrors: FieldErrors = {
      email: validateEmail(values.email) ?? undefined,
      password: validateRequired(values.password, "Password") ?? undefined,
    }
    const hasErrors = Object.values(nextErrors).some(Boolean)

    setErrors(nextErrors)
    if (hasErrors) {
      setCollected(null)
      return
    }

    // TODO: swap for authClient.signIn.email(values) once the auth API is ready.
    console.info("[sign-in] collected form data", values)
    setCollected(values)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthField
          id="signin-password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        <Button type="submit" variant="brand" size="lg" className="h-11 w-full">
          Sign In
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton label="Continue with Google" />

      {collected ? (
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Form data collected for <strong>{collected.email}</strong>. Connect the
          auth API to complete sign in.
        </p>
      ) : null}
    </div>
  )
}
