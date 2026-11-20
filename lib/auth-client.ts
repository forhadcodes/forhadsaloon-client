import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

import type { auth } from "@/lib/auth"

/**
 * Better Auth browser client.
 *
 * No baseURL is needed: the auth API is served by this same Next.js app
 * at /api/auth/*, so the client resolves the current origin automatically.
 * `inferAdditionalFields` teaches the client about `role` and `isBlocked`
 * so `session.user` is typed without casts.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, signOut, useSession } = authClient
