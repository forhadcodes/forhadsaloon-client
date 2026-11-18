/**
 * Shared domain types for SalonBook.
 *
 * These mirror the MongoDB collections defined in the assignment brief.
 * Keep this file as the single source of truth so UI components never
 * re-declare the same shapes.
 */

export type UserRole = "admin" | "customer"

/** The subset of the Better Auth user document the UI needs. */
export type CurrentUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role: UserRole
}

/** One slide of the home page hero banner. */
export type BannerSlide = {
  image: string
  alt: string
  eyebrow: string
  title: string
  description: string
}

/** Values collected by the sign-in form (API wiring comes later). */
export type SignInInput = {
  email: string
  password: string
}

/** Values collected by the sign-up form (API wiring comes later). */
export type SignUpInput = {
  name: string
  email: string
  password: string
  image?: string
}
