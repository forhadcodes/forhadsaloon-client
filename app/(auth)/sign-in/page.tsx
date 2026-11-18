import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { AuthTabs } from "@/components/auth/auth-tabs"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your appointments."
    >
      <AuthTabs />
      <SignInForm />
    </AuthShell>
  )
}
