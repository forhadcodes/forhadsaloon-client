import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { jwt } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

import { AUTH_MESSAGES } from "@/lib/constants"
import { salonDb, mongoClient } from "@/lib/mongodb"

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
const secret = process.env.BETTER_AUTH_SECRET
if (!secret) throw new Error("BETTER_AUTH_SECRET is not configured.")

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : undefined

function passwordIsValid(value: unknown): boolean {
  return (
    typeof value === "string" &&
    value.length >= 6 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value)
  )
}

export const auth = betterAuth({
  baseURL,
  secret,
  trustedOrigins: [baseURL],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
  },

  ...(google ? { socialProviders: { google } } : {}),

  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "customer", input: false },
      isBlocked: { type: "boolean", defaultValue: false, input: false },
      phone: { type: "string", required: false },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as { password?: unknown }
        if (!passwordIsValid(body.password)) {
          throw new APIError("BAD_REQUEST", { message: AUTH_MESSAGES.passwordRules })
        }
      }
    }),
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session, context) => {
          if (!context) return
          const user = await context.context.internalAdapter.findUserById(session.userId)
          if ((user as { isBlocked?: boolean } | null)?.isBlocked) {
            throw new APIError("FORBIDDEN", { message: AUTH_MESSAGES.blocked })
          }
        },
      },
    },
  },

  plugins: [
    jwt({
      jwt: { expirationTime: "15m", issuer: baseURL, audience: baseURL },
    }),
    nextCookies(),
  ],

  database: mongodbAdapter(salonDb, { client: mongoClient, usePlural: true }),
})

export type Auth = typeof auth
