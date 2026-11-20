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

export type Service = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: "active" | "inactive"
  createdAt?: string
}

export type Appointment = {
  id: string
  serviceId: string | { serviceName: string; image: string; category: string; duration: number; price?: number }
  customerId: string | { name: string; email: string; phone?: string; image?: string | null }
  appointmentDate: string
  timeSlot: string
  message?: string
  servicePrice: number
  paymentStatus: "unpaid" | "paid"
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
  transaction?: { amount: number; currency: string; createdAt: string }
}

export type Transaction = {
  id: string
  appointmentId: string | { appointmentDate: string; timeSlot: string; serviceName?: string }
  customerId: string | { name: string; email: string }
  amount: number
  currency: string
  stripeSessionId: string
  status: "paid" | "failed"
  createdAt: string
}

export type ApiEnvelope<T> = { success: boolean; message?: string; data: T }
export type Paginated<T> = { items: T[]; total: number; page: number; pages: number }
