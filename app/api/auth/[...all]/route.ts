import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@/lib/auth"

/**
 * Better Auth catch-all API route.
 * Serves every auth endpoint under /api/auth/* (session, sign in, sign up, ...).
 */
export const { GET, POST } = toNextJsHandler(auth)
