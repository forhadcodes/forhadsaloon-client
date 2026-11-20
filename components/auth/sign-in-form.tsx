"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { AuthDivider } from "@/components/auth/auth-divider"
import { AuthField } from "@/components/auth/auth-field"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { GoogleButton } from "@/components/auth/google-button"
import { Button } from "@/components/ui/button"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { signIn } from "@/lib/auth-client"
import { AUTH_MESSAGES, ROUTES } from "@/lib/constants"
import type { SignInInput } from "@/lib/types"
import { validateEmail, validateRequired } from "@/lib/validation"

type FieldErrors = Partial<Record<keyof SignInInput, string>>

export function SignInForm() {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const formData = new FormData(event.currentTarget)
    const values: SignInInput = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    }

    const nextErrors: FieldErrors = {
      email: validateEmail(values.email) ?? undefined,
      password: validateRequired(values.password, "Password") ?? undefined,
    }

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      setFormError(null)
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
    })

    if (error) {
      const message = getAuthErrorMessage(error, AUTH_MESSAGES.signInError)
      setFormError(message)
      toast.error(message)
      setIsSubmitting(false)
      return
    }

    toast.success(AUTH_MESSAGES.signInSuccess)
    // Dashboard routes arrive in the next task; home keeps this flow 404-free.
    router.replace(ROUTES.home)
    router.refresh()
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
          disabled={isSubmitting}
          error={errors.email}
        />
        <AuthField
          id="signin-password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isSubmitting}
          error={errors.password}
        />

        <AuthFormError message={formError} />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="h-11 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton label="Continue with Google" disabled={isSubmitting} />
    </div>
  )
}
