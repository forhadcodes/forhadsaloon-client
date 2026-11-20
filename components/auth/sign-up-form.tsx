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
import { authClient } from "@/lib/auth-client"

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

  
   const handleSignUp = async (data: { name: string; email: string; password: string; image: string }) => {
       const { data: signUpResponse, error } = await authClient.signUp.email({
         name: data.name, // required, The name of the user.
         email: data.email, // required, The email address of the user.
         password: data.password, // required, The password of the user. It should be at least 8 characters long and max 128 by default.
         image: data.image, // An optional profile image of the user.
         callbackURL: "/", // An optional URL to redirect to after the user signs up.
       })
    const hasErrors = Object.values(data).some(Boolean)

    setErrors(data)
    if (hasErrors) {
      setCollected(null)
      return
    }

    // TODO: swap for authClient.signUp.email(values) once the auth API is ready.
    console.info("[sign-up] collected form data", data)
    setCollected(data)
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const values = new FormData(event.currentTarget)
          void handleSignUp({
            name: String(values.get("name") ?? ""),
            email: String(values.get("email") ?? ""),
            password: String(values.get("password") ?? ""),
            image: String(values.get("image") ?? ""),
          })
        }}
        noValidate
        className="space-y-4"
      >
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
