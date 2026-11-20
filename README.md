# SalonBook (Client)

SalonBook is a salon appointment booking platform. Customers browse services, request appointments, and pay securely with Stripe after an admin confirms the booking. This repository is the Next.js client, which also hosts Better Auth (email/password + Google) and the JWT/JWKS endpoint used by the Express API.

## Important Features

- Public home page with featured services, dynamic service categories and a responsive browse page (name search, category filter, price sorting, URL-synced filters).
- Protected service details page with date/time availability and an appointment request form.
- Customer dashboard: appointment stats, own appointments with details, cancellation of pending requests, Pay Now via Stripe Checkout.
- Admin dashboard: service CRUD with ImgBB uploads, appointment review/confirm/cancel, customer block/unblock, statistics and a read-only transactions table.
- Role-aware navigation, server-side session/role/blocked guards, instant session updates, toasts, skeletons and empty/error states.
- DaisyUI "salon" theme, Playfair Display + Inter fonts, fully responsive from 360px upward.

## Technology Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, DaisyUI 5, Better Auth (MongoDB adapter + JWT plugin), MongoDB driver, react-hook-form, zod, react-hot-toast, lucide-react. Deployed on Vercel.

## Installation

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your own values (never commit it). Use the same `MONGODB_URI` database as the server.

## Run Locally

```bash
# 1. In the salonbook-server repo: npm install, copy .env.example to .env,
#    then run `npm run db:indexes` once, `npm run db:seed:services` for demo data,
#    and start it with `npm run dev` (port 5000)
# 2. Create the admin account (idempotent; uses ADMIN_* values from .env.local)
npm run seed:admin

# 3. Start the client
npm run dev
```

Open http://localhost:3000. Other useful commands: `npm run typecheck`, `npm run lint`, `npm run build`.

The Stripe webhook is forwarded to the **server** repo with the Stripe CLI:
`stripe listen --forward-to localhost:5000/api/webhooks/stripe`

## Required Environment Variables

`MONGODB_URI`, `MONGODB_DB_NAME`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`

`MONGODB_DB_NAME` is optional (defaults to `forhadsaloondb`) but must match the server's value — both apps share one database.

Seed script only (local, never deployed): `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

Stripe and ImgBB keys must never be present in this repository — they live only in the server repo.

## Live Website

To be added after deployment.

## Repositories

- Client: https://github.com/forhadcodes/forhadsaloon-client
- Server: https://github.com/forhadcodes/forhadsaloon-server
