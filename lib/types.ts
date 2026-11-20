/**
 * Shared domain types for SalonBook.
 *
 * These mirror the MongoDB collections defined in the assignment brief.
 * Keep this file as the single source of truth so UI components never
 * re-declare the same shapes.
 */

export type UserRole = "admin" | "customer"
export type PaymentStatus = "unpaid" | "paid"

/** The subset of the Better Auth user document the UI needs. */
export type CurrentUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role: UserRole
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

export type ServiceCategoryCount = { name: string; count: number }
export type AppointmentStats = { total: number; pending: number; confirmed: number; cancelled: number }
export type AdminStats = {
  totalCustomers: number
  totalActiveServices: number
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  totalSuccessfulPayments: number
}

/** Shape returned by the server for any user (never contains sensitive fields). */
export type UserSummary = {
  id: string
  name: string
  email: string
  image?: string | null
  role: UserRole
  isBlocked: boolean
  phone?: string | null
  createdAt?: string
}

/** Read-only payment status; the client can never mark an appointment paid. */
export type PaymentSession = {
  confirmed: boolean
  amount: number
  currency: string
  appointment: {
    id: string
    serviceName: string
    appointmentDate: string
    timeSlot: string
    paymentStatus: PaymentStatus
  }
}
