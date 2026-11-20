"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

import { signOut } from "@/lib/auth-client"
import { AUTH_MESSAGES, ROUTES } from "@/lib/constants"

export function useSignOut() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)

    const { error } = await signOut()
    setIsSigningOut(false)

    if (error) {
      toast.error("Could not sign out. Please try again.")
      return
    }

    toast.success("Signed out successfully.")
    router.push(ROUTES.home)
    router.refresh()
  }

  return { handleSignOut, isSigningOut }
}
