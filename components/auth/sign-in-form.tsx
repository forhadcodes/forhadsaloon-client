"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

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

const QUERY_MESSAGES: Record<string, string> = {
  blocked: AUTH_MESSAGES.blocked,
  session_expired: AUTH_MESSAGES.sessionExpired,
  oauth_failed: AUTH_MESSAGES.googleError,
}

function safeRedirect(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null
}

export function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirect = safeRedirect(params.get("redirect"))

  useEffect(() => {
    const error = params.get("error")
    if (error) {
      const message = QUERY_MESSAGES[error] ?? AUTH_MESSAGES.signInError
      setFormError(message)
      toast.error(message)
    }
  }, [params])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = new FormData(event.currentTarget)
    const values = {
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    }
    const nextErrors: FieldErrors = {
      email: validateEmail(values.email) ?? undefined,
      password: validateRequired(values.password, "Password") ?? undefined,
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setIsSubmitting(true)
    setFormError(null)
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: redirect ?? ROUTES.callback,
    })
    setIsSubmitting(false)

    if (error) {
      const message = getAuthErrorMessage(error, AUTH_MESSAGES.invalidCredentials)
      setFormError(message)
      toast.error(message)
      return
    }

    toast.success(AUTH_MESSAGES.signInSuccess)
    router.push(redirect ?? ROUTES.callback)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField id="signin-email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" error={errors.email} />
        <AuthField id="signin-password" name="password" type="password" label="Password" placeholder="Enter your password" autoComplete="current-password" error={errors.password} />
        <AuthFormError message={formError} />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton label="Continue with Google" disabled={isSubmitting} redirect={redirect ?? undefined} />
    </div>
  )
}
