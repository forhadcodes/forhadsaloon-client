import type { BannerSlide, UserRole } from "@/lib/types"

/** Static site information. Replace the placeholders with real salon details. */
export const SITE = {
  name: "forhadsaloon",
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
  signIn: "/sign-in",
  signUp: "/sign-up",
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
  customer: ROUTES.dashboard,
}

/**
 * Home page hero slides. Each slide owns its copy so switching the image
 * also switches the message, instead of repeating one headline three times.
 * Photos: Unsplash (free to use under the Unsplash License).
 */
export const BANNER_SLIDES: BannerSlide[] = [
  {
    image: "/images/banner-cuts.jpg",
    alt: "Barbershop interior with vintage chairs and warm brick walls",
    eyebrow: "Signature Cuts",
    title: "Sharp Cuts, Timeless Style",
    description:
      "Precision fades, classic scissor work and beard shaping by stylists who sweat the details.",
  },
  {
    image: "/images/banner-care.jpg",
    alt: "Stylist blow-drying and styling a client's hair",
    eyebrow: "Hair Care",
    title: "Wash, Treat, Restore",
    description:
      "Deep-cleansing washes and scalp treatments that leave your hair softer, calmer and easier to style.",
  },
  {
    image: "/images/banner-color.jpg",
    alt: "Modern salon with round mirrors and black styling stations",
    eyebrow: "Color & Glam",
    title: "Color That Turns Heads",
    description:
      "Balayage, gloss and custom blends crafted around your skin tone, your hair and your routine.",
  },
]

/** The one call to action every hero slide shares. */
export const BANNER_CTA = {
  label: "Explore Salon Services",
  href: ROUTES.services,
} as const
