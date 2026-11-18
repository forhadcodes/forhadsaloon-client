"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { signOut } from "@/lib/auth-client"
import { ROUTES } from "@/lib/constants"

/**
 * Shared sign-out behaviour so the profile dropdown and the mobile menu
 * cannot drift apart. Better Auth updates the session store, which makes
 * the navbar switch back to its signed-out state immediately.
 */
export function useSignOut() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      const { error } = await signOut()
      if (error) return

      router.push(ROUTES.home)
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return { handleSignOut, isSigningOut }
}
