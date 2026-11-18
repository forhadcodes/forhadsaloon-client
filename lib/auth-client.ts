import { createAuthClient } from "better-auth/react"

/**
 * Better Auth browser client.
 *
 * No baseURL is needed: the auth API is served by this same Next.js app
 * at /api/auth/*, so the client resolves the current origin automatically.
 */
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
