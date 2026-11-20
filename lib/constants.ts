import type { UserRole } from "@/lib/types"

/** Static site information. Replace the placeholders with real salon details. */
export const SITE = {
  name: "SalonBook",
  logo: "/images/logo-forhadsaloon.jpg",
  tagline: "Book your next salon visit in seconds.",
  description:
    "forhadsaloon lets you browse salon services and request appointments online, with instant confirmation and secure payment.",
} as const

/**
 * Every route lives here instead of being typed by hand in components.
 * If a path changes, it changes in one place only.
 */
export const ROUTES = {
  home: "/",
  services: "/services",
  signIn: "/signin",
  signUp: "/signup",
  callback: "/auth/callback",
  dashboard: "/dashboard",
  adminDashboard: "/dashboard/admin",
  profile: "/dashboard/profile",
} as const

export type NavLink = {
  label: string
  href: string
}

/** Links every visitor can see (public routes from the brief). */
export const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.home },
  { label: "Browse Services", href: ROUTES.services },
]

/** Where each role lands after signing in. */
export const DASHBOARD_HOME: Record<UserRole, string> = {
  admin: ROUTES.adminDashboard,
  customer: "/dashboard/customer",
}

/**
 * Feedback copy for the auth screens. Keeping it here means the sign-in and
 * sign-up forms describe the same error the same way.
 */
export const AUTH_MESSAGES = {
  signUpSuccess: "Account created. Welcome to SalonBook!",
  signInSuccess: "Signed in successfully.",
  invalidCredentials: "Email or password is incorrect.",
  emailTaken: "An account with this email already exists. Try signing in.",
  passwordLength: "Password must have at least 6 characters, one uppercase and one lowercase letter.",
  passwordRules: "Password must have at least 6 characters, one uppercase and one lowercase letter.",
  sessionExpired: "Your session has expired. Please sign in again.",
  blocked: "This account has been blocked. Please contact the salon.",
  signUpError: "Could not create your account. Please try again.",
  signInError: "Could not sign you in. Please try again.",
  googleError: "Google sign-in could not be completed. Please try again.",
  pendingGoogle: "Connecting to Google...",
} as const

/**
 * Home page hero. One local, optimised photo sits behind a dark overlay so
 * the copy stays readable at every breakpoint.
 * Photo: Unsplash (free to use under the Unsplash License).
 */
export const HERO = {
  image: "/images/banner-color.jpg",
  alt: "Modern salon interior with round mirrors and black styling stations",
  eyebrow: "Welcome to SalonBook",
  title: "Beautiful hair, booked in seconds",
  description:
    "Browse our services, pick a time that suits you and pay securely once your stylist confirms the appointment.",
  cta: {
    label: "Explore Salon Services",
    href: ROUTES.services,
  },
} as const

/** Shared with the Express server — keep both copies identical. */
export const SALON_TIMEZONE = "Asia/Dhaka"

export const CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const
export type ServiceCategory = (typeof CATEGORIES)[number]

export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]

export const APPOINTMENT_STATUS = ["pending", "confirmed", "cancelled"] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number]

export const PAYMENT_STATUS = ["unpaid", "paid"] as const
export type PaymentStatus = (typeof PAYMENT_STATUS)[number]

export const SERVICE_STATUS = ["active", "inactive"] as const
export type ServiceStatus = (typeof SERVICE_STATUS)[number]

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
