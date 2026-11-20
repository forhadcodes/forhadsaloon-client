import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { MongoClient } from "mongodb"

import { AUTH_MESSAGES } from "@/lib/constants"

/** Atlas database that holds the four collections described in the brief. */
const DB_NAME = "forhadsaloondb"

/**
 * The brief names this variable `MONGODB_URI`; the older `BETTER_AUTH_DB_URI`
 * key is still accepted so an existing local .env keeps working.
 */
const mongoUri = process.env.MONGODB_URI ?? process.env.BETTER_AUTH_DB_URI

if (!mongoUri) {
  throw new Error(
    "MongoDB is not configured. Add MONGODB_URI to your .env file."
  )
}

/**
 * Next.js re-evaluates modules on every hot reload in development, so a fresh
 * MongoClient per reload would leak connections. Reuse one client instead.
 */
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient
}

const client = globalForMongo.mongoClient ?? new MongoClient(mongoUri)
globalForMongo.mongoClient = client

const db = client.db(DB_NAME)

/** Google is optional: only enable it once both OAuth keys exist. */
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : null

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    // Matches the rules in lib/validation.ts so client and server agree.
    minPasswordLength: 8,
  },

  ...(googleProvider ? { socialProviders: { google: googleProvider } } : {}),

  user: {
    additionalFields: {
      /**
       * `input: false` keeps role and blocked status out of the sign-up and
       * update payloads: only the server (seed script / admin action) sets them.
       */
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          if (!ctx) return

          const user = await ctx.context.internalAdapter.findUserById(
            session.userId
          )
          if ((user as { isBlocked?: boolean } | null)?.isBlocked) {
            throw new APIError("FORBIDDEN", {
              message: AUTH_MESSAGES.blocked,
            })
          }
        },
      },
    },
  },

  // `usePlural` keeps the collections aligned with the brief: users, sessions...
  database: mongodbAdapter(db, { client, usePlural: true }),

  // Must stay last: forwards Better Auth cookies to Next.js.
  plugins: [nextCookies()],
})
