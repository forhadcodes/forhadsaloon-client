"use client"

import { useSession } from "@/lib/auth-client"
import type { CurrentUser, UserRole } from "@/lib/types"

/**
 * Better Auth stores `role` as a plain string because the field is defined
 * on the server. Narrow it here so the rest of the app gets a typed role
 * and a safe default for accounts created before roles existed.
 */
function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "customer"
}

/**
 * Reads the signed-in user and exposes it in a UI-friendly shape.
 * Uses Better Auth's reactive session store, so the navbar (and anything
 * else using this hook) re-renders as soon as the user signs in or out.
 */
export function useCurrentUser() {
  const { data, isPending } = useSession()
  const sessionUser = data?.user

  const user: CurrentUser | null = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.image,
        role: normalizeRole(sessionUser.role),
      }
    : null

  return { user, isLoading: isPending }
}
