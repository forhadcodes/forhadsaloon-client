import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { DASHBOARD_HOME, ROUTES } from "@/lib/constants"
import type { UserRole } from "@/lib/types"

export type SessionUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: UserRole
  isBlocked: boolean
}

/** Fresh session read on the server — never uses the browser's cached client. */
export async function getSession(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    role: session.user.role === "admin" ? "admin" : "customer",
    isBlocked: Boolean(session.user.isBlocked),
  }
}

/**
 * Authoritative guard for private pages. Roles come from the database via
 * Better Auth, not from the JWT payload or the browser.
 */
export async function requireRole(role: UserRole | "any") {
  const user = await getSession()
  if (!user) redirect(`${ROUTES.signIn}?redirect=${encodeURIComponent("/dashboard")}`)
  if (user.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)

  if (role !== "any" && user.role !== role) {
    redirect(DASHBOARD_HOME[user.role])
  }
  return user
}
