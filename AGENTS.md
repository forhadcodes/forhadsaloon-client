<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook — Assignment 9 (Category 002) requirements

Salon appointment booking platform. These requirements come from the official
assignment brief (`A-9 reqr docs.docx`) and stay valid for every UI task in this
repo. Read this section before building any page or component.

## Stack

- Client: Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- Server: separate repository — Express.js + MongoDB (Mongoose optional) + JWT
- Auth: Better Auth (`role` + `isBlocked` live on the user document)
- Payments: Stripe Checkout + verified webhook
- Image hosting: ImgBB

## UI inspiration only (never copy designs)

- Baberage barber template, Vankas barbershop template,
- Figma "Salon Booking UI Kit" and "salon figma design" community files.
- Platforms to study for UX: Fresha, Booksy, Vagaro.

## Database — exactly four collections

- `users` (Better Auth): name, email, image, role, isBlocked
- `services`: serviceName, category, description, price, duration, image,
  status (`active` | `inactive`), createdAt
- `appointments`: serviceId, customerId, appointmentDate, timeSlot, message,
  servicePrice, paymentStatus (`unpaid` | `paid`),
  status (`pending` | `confirmed` | `cancelled`), createdAt
- `transactions`: appointmentId, customerId, amount, currency,
  stripeSessionId, status (`paid` | `failed`), createdAt

Do not invent extra collections for the same information.

## Routes / pages

- Public: `/` (Home), `/services` (Browse Services), `/sign-in`, `/sign-up`
- Protected: `/services/[id]` (service details + booking), `/dashboard`
- Customer dashboard: Overview, My Appointments, My Profile
- Admin dashboard: Overview, Manage Services (+ Add/Update), Manage Appointments,
  Manage Users, Transactions, My Profile
- Payment: success page + cancel page
- Route strings live in `ROUTES` inside `lib/constants.ts`; role landing pages in
  `DASHBOARD_HOME`. Never hardcode paths in components.

## Navbar / footer contract

- Navbar: logo "SalonBook", Home, Browse Services, then Sign In + Sign Up when
  signed out, or the profile dropdown (user name, Dashboard, Logout) when signed
  in. Content must update immediately on auth changes.
- Footer: logo + short description, important links, contact info, address and
  opening hours, social links, copyright.

## Business rules (must be enforced on the server too)

- Guests can browse; only signed-in **customers** can book. Admins cannot book.
- Only `active` services appear publicly and can be booked.
- No duplicate active appointment for the same date + time slot.
- Customer: sees only own appointments, cancels only own `pending` ones, pays
  only `confirmed` ones. Cannot pay for pending/cancelled.
- Admin: confirms only `pending`; cancels `pending`/`confirmed`; manages all
  appointments, services and customers; can block/unblock users.
- Blocked users lose access to protected features.
- Role and blocked status must never be changeable via profile update.
- Payment status becomes `paid` **only** from a verified Stripe webhook. Admins
  can never edit payment records manually.

## Payments flow

Booking (pending/unpaid) → admin confirms → customer clicks Pay Now → Stripe
Checkout → success/cancel page → verified webhook writes the `transactions`
record and sets `paymentStatus: paid`.

## Environment variables (names only — never commit values)

`MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `IMGBB_API_KEY`, `NEXT_PUBLIC_API_URL`.

## Assignment scoring checklist

- 20+ meaningful client commits, 12+ meaningful server commits.
- Separate client and server repos, each with a README (features, stack,
  install/run steps, env var names, live link, repo links).
- Everything responsive; no CORS, 404, 504 or reload errors; private routes work
  after refresh; Stripe works live; seeded admin credentials work live.

## Code rules for this repo

- Build small, reusable components. Extend an existing component instead of
  copying markup; put shared pieces in `components/`, hooks in `hooks/`.
- No hardcoded content: text in `lib/constants.ts`, domain shapes in
  `lib/types.ts`, colors via CSS tokens in `app/globals.css`.
- Keep the design system consistent: `brand` button variant, `StatusBadge`,
  cards, tables and dialogs are shared primitives.
- Moderate, readable code with short comments explaining "why", not "what".
- Toasts for feedback (never `alert()`), meaningful loading and error states.
- Don't build features that are not in the brief; ask when a requirement is
  ambiguous.

## Current progress

- Done: design tokens (`--brand`), navbar (desktop + mobile sheet), profile
  dropdown, session hook, sign-out hook, auth client fix, auth route handler.
- Pending: auth pages, public pages, dashboards, Stripe, footer, SEO polish.
