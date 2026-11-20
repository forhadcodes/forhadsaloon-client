import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthShell } from "@/components/auth/auth-shell"
import { AuthTabs } from "@/components/auth/auth-tabs"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = { title: "Sign In" }

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your appointments.">
      <AuthTabs />
      <Suspense fallback={<Spinner />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  )
}
