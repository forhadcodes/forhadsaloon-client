import { config } from "dotenv"

// .env.local wins (same precedence as Next.js); .env is the fallback for
// setups that keep all values in a single file.
config({ path: ".env.local" })
config({ path: ".env" })

const { name, email, password } = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
}

if (!name || !email || !password) {
  throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before seeding.")
}
if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
  throw new Error("ADMIN_PASSWORD needs 6+ characters, one uppercase and one lowercase letter.")
}

const { auth } = await import("../lib/auth")
const { salonDb, mongoClient } = await import("../lib/mongodb")

const users = salonDb.collection("users")
const existing = await users.findOne({ email })

if (!existing) {
  const result = await auth.api.signUpEmail({ body: { name, email, password } })
  if (!result?.user) throw new Error("Admin account could not be created.")
  console.info("Created admin account:", email)
} else {
  console.info("Admin account already exists:", email)
}

await users.updateOne({ email }, { $set: { role: "admin", isBlocked: false } }, { upsert: false })
console.info("Admin role confirmed.")
await mongoClient.close()
