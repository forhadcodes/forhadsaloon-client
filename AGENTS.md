# SalonBook — Master Build Prompt v2 (audited line-by-line against the requirements docx)

**How to use**
1. Paste **Section 0** into your AI coding tool once (Claude Code, Cursor, etc.).
2. Paste **one Step at a time**, in order. Each step ends with tests and exact git commits. Do not move on until the tests pass.
3. Steps are ordered so that everything you build can be tested when you build it (Better Auth exists before the server JWT middleware, admin service CRUD exists before Home/Browse need data, and so on).
4. The last section is a **traceability matrix**: every requirement in the docx mapped to the step that delivers it.
5. Be concise. Output only required code changes without long explanations.
> The requirement video `A9_CAT_002.mp4` could not be reviewed when this prompt was written. If it adds anything beyond the docx, paste it into the "EXTRA REQUIREMENTS FROM VIDEO" block in Section 0.

---

## SECTION 0 — CONTEXT (paste this first, once)

```
You are a senior full-stack engineer pair-programming with me on a hiring assignment: "SalonBook - Salon Appointment Booking Platform". I am a MERN developer. Follow every rule below exactly.

WORKING STYLE
- Only do the step I paste. Do not build ahead.
- Make sensible decisions yourself; ask me only if truly blocked. State each decision in one line.
- When you use Better Auth, Stripe, Next.js, Tailwind/DaisyUI, Mongoose or Vercel APIs, check the official docs for the INSTALLED version instead of guessing. If the docs differ from this prompt, follow the docs and tell me.
- At the end of every step give: (1) files created/changed, (2) the tests I must run, (3) git commands using the exact commit messages listed in the step, one commit per feature, never one giant commit.
- Never use alert(). Never leave console.log of secrets. No dead code, no TODO placeholders in finished steps.

PROJECT
SalonBook lets customers browse salon services, request appointments, and pay (Stripe) for appointments the admin has confirmed. The admin manages services, appointments, customers, and views transactions.

STACK (fixed)
- Client repo "salonbook-client": Next.js (App Router) + TypeScript + Tailwind CSS + DaisyUI + react-hot-toast + react-hook-form + zod + lucide-react. Deployed on Vercel.
- Server repo "salonbook-server": Node.js + Express + TypeScript + MongoDB (Mongoose) + zod + jose + stripe + multer + helmet + cors + express-rate-limit + morgan. Deployed on Vercel.
- Auth: Better Auth (email/password + Google OAuth) running INSIDE the Next.js app, MongoDB adapter, JWT plugin. The Express server verifies the JWT (jose + the JWKS endpoint of the Next.js app).
- Payments: Stripe Checkout (test mode, currency USD) + verified webhook.
- Images: ImgBB. The ImgBB key lives ONLY on the server; the browser uploads via the Express server.
- Database: one MongoDB Atlas database used by both apps.

ENVIRONMENT VARIABLES (names only; values never committed; .env.example in both repos)
Server repo: PORT, NODE_ENV, MONGODB_URI, CLIENT_URL, BETTER_AUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, IMGBB_API_KEY
Client repo: MONGODB_URI, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_API_URL; seed script only (local, never deployed): ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
- BETTER_AUTH_URL = the deployed URL of the client app (where Better Auth runs). CLIENT_URL = same origin, used for CORS and Stripe redirect URLs.
- Stripe and ImgBB keys must never exist in the client repo. Only NEXT_PUBLIC_API_URL is exposed to the browser.
- .gitignore must contain .env*, with !.env.example allowed.

SECURITY MODEL (three layers, all required)
1. UI: hide links/buttons by role (cosmetic only).
2. Next.js: optimistic cookie check in middleware/proxy + authoritative server-side role and isBlocked check in the dashboard layouts and the /services/[id] page (fresh session, cookie cache disabled).
3. Express: EVERY protected route runs verifyJWT -> loadUser (re-reads the user from MongoDB) -> role check. Role and isBlocked always come from the database, never from the JWT payload or the request body.
Other rules:
- Admin routers are mounted as router.use("/admin", auth, adminOnly) so no admin route can forget the guard.
- Request bodies are validated with zod .strict() schemas, so unknown keys (role, isBlocked, paymentStatus, servicePrice, status on create, etc.) are rejected. No client can set paymentStatus, servicePrice, role or isBlocked.
- User search input is regex-escaped before use in $regex. All :id params are validated as ObjectIds (400 "Invalid ... id").
- paymentStatus becomes "paid" ONLY inside the verified Stripe webhook handler (stripe.webhooks.constructEvent on the raw body). No other code path sets it. No endpoint can create or edit transactions.
- Public sign-up can never create an admin. Admin is created by a seed script. role and isBlocked are Better Auth additionalFields with input:false.

DATA MODEL (MongoDB; Better Auth also keeps its own session/account/verification/jwks collections, which is expected)
users (Better Auth, collection name "users" via user.modelName): name, email, image, role ("customer"|"admin", default "customer"), isBlocked (boolean, default false), phone (optional), createdAt
services: serviceName, category, description, price (number > 0), duration (minutes, number > 0), image (ImgBB URL), status ("active"|"inactive", default "active"), createdAt
appointments: serviceId (ref services), customerId (ref users), appointmentDate, timeSlot, message (optional), servicePrice (snapshot of price at booking), paymentStatus ("unpaid"|"paid", default "unpaid"), status ("pending"|"confirmed"|"cancelled", default "pending"), createdAt
transactions: appointmentId (ref appointments), customerId (ref users), amount, currency, stripeSessionId (unique), status ("paid"|"failed"), createdAt
Do not create any other collection.

SHARED CONSTANTS (identical in both repos)
CATEGORIES: Haircut & Styling, Hair Coloring, Hair Treatment, Facial & Skincare, Makeup, Manicure & Pedicure, Spa & Massage
TIME_SLOTS: 09:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 02:00 PM, 03:00 PM, 04:00 PM, 05:00 PM, 06:00 PM
APPOINTMENT_STATUS: pending, confirmed, cancelled     PAYMENT_STATUS: unpaid, paid
Appointment date is sent as "YYYY-MM-DD" and stored as a Date at UTC midnight. "Today" is computed in the salon time zone (constant SALON_TIMEZONE = "Asia/Dhaka").

ROUTE MAP (client)
Public: /  /services  /signin  /signup  /auth/callback (post-login redirect hub)  /unauthorized
Private: /services/[id]  /payment/success  /payment/cancel
Customer dashboard: /dashboard/customer  /dashboard/customer/appointments  /dashboard/customer/profile
Admin dashboard: /dashboard/admin  /dashboard/admin/services  /dashboard/admin/services/new  /dashboard/admin/services/[id]/edit  /dashboard/admin/appointments  /dashboard/admin/users  /dashboard/admin/transactions  /dashboard/admin/profile
/dashboard redirects to the user's own role dashboard. A user opening the other role's dashboard URL is redirected to their own dashboard.

DESIGN SYSTEM (use exactly; this is what makes the UI consistent)
- Theme: DaisyUI custom theme "salon", light only. Colors: primary #B4536B (dusty rose, white text on it passes AA), secondary #2F2A2B (charcoal), accent #C9A35A (gold: decorative only, never for text), base-100 #FFFFFF, base-200 #FAF5F2 (warm cream), base-300 #EFE5E0, neutral #2F2A2B, success #3E8E6B, warning #D9A441, error #C8453F, info #3B7DA8.
- Fonts: Playfair Display for headings (font-serif), Inter for body. h1 text-4xl md:text-6xl, h2 text-3xl md:text-4xl, h3 text-xl, body 16px/1.6, small 14px.
- Layout: container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; section spacing py-14 md:py-20; spacing in multiples of 4px.
- Shape: cards rounded-2xl, buttons/inputs rounded-xl, border border-base-300, shadow-sm (hover:shadow-md). Only 150ms color/shadow transitions; no other animation.
- Controls: min height 44px (touch target); label above input; error text below input in error color; visible focus ring in primary; loading buttons show a spinner and are disabled.
- ServiceCard: image aspect-[4/3] object-cover, category badge, name (line-clamp-1), short description (line-clamp-2), footer with price (bold, Intl USD) and duration (clock icon, "60 min"), full-width "View Details" button. Grids: 1 col <640px, 2 cols >=640px, 3 cols >=1024px.
- Status badges: pending=warning, confirmed=info, cancelled=error, paid=success, unpaid=neutral outline, active=success, inactive=neutral.
- Icons: lucide-react only (no emoji). Dates formatted "20 Nov 2026". Prices "$45.00".
- Dashboard: sidebar w-64 fixed on lg+, drawer below lg; content p-4 sm:p-6 lg:p-8; stat cards grid 1/2/4 cols; data tables on md+ inside an overflow-x-auto wrapper, stacked cards below md. Never any horizontal page scroll at 360px.

HARD RULES
1. No .env or secret ever committed. No secret in the client bundle.
2. Client commits >= 20 and server commits >= 12, all meaningful Conventional Commit messages (feat:, fix:, chore:, docs:, style:, refactor:). Commit after each working feature.
3. Separate repos, README in each (project name + description, important features, technology stack, installation, how to run locally, required env variable NAMES, live website link, client + server repo links).
4. Production behaviour: no CORS errors, no 404/504, reload works on every route, private routes work after refresh, user stays logged in after refresh.
5. Original design only. Fresha/Booksy/Vagaro are inspiration only.
6. Toasts (react-hot-toast) for every success and failure; confirmation dialogs for destructive actions; meaningful loaders for: fetching services, loading dashboard data, creating appointment requests, processing payments.

EXTRA REQUIREMENTS FROM VIDEO (fill in or delete)
- (none yet)

Reply only with: a short architecture summary, the folder structure of both repos, and the list of npm packages per repo. Do not write code yet.
```

---

## PHASE 1 — FOUNDATION

### STEP 1 — Server: setup (server commits 1–2)

```
In salonbook-server initialize Express + TypeScript.
- Folders: src/{config,models,middleware,routes,controllers,utils,scripts,validators}
- config/env.ts: validate all server env vars with zod, fail fast with a clear message.
- config/db.ts: cached Mongoose connection stored on globalThis (serverless-safe), serverSelectionTimeoutMS 8000, reused across invocations.
- utils: ApiError class, asyncHandler, validate(schema) middleware (zod, .strict() bodies), escapeRegex, isValidObjectId helper.
- app.ts: helmet, morgan, CORS allowing ONLY CLIENT_URL (credentials true; methods GET/POST/PATCH/PUT/DELETE/OPTIONS; allow Authorization + Content-Type headers), global rate limit (express-rate-limit), and a clearly commented slot ABOVE express.json() reserved for the Stripe webhook route (added in Step 13; it needs the raw body).
- GET /api/health, global 404 handler (JSON), central error handler returning { success:false, message, errors? } with correct status codes and no stack traces in production.
- Vercel: follow the current Vercel Express deployment docs so every /api/* route is reachable (export the app; add vercel.json or api entry only if the docs require it).
- .gitignore, .env.example (names only), README skeleton.
Test: npm run dev -> GET /api/health = 200; unknown route = JSON 404; no secrets in git status.
Server commits: "chore: init express typescript server", "feat: add env validation, cached db connection and central error handling"
```

### STEP 2 — Client: setup, design system, shared UI, footer (client commits 1–3)

```
In salonbook-client create the Next.js app (TypeScript, App Router, Tailwind, ESLint, src/ directory) and add DaisyUI, react-hot-toast, react-hook-form, zod, @hookform/resolvers, lucide-react, better-auth, mongodb.
- Implement the DESIGN SYSTEM from Section 0 exactly: DaisyUI "salon" theme in globals.css (use the syntax of the installed DaisyUI version), Playfair Display + Inter via next/font.
- next.config: images.remotePatterns for i.ibb.co and lh3.googleusercontent.com (Google avatars).
- src/lib: constants.ts (CATEGORIES, TIME_SLOTS, statuses), types.ts, utils.ts (formatPrice, formatDate), api.ts skeleton (typed fetch wrapper using NEXT_PUBLIC_API_URL that parses { success, message } errors; the Bearer token is added in Step 5).
- Reusable components in src/components/ui: Button (variants + loading), Input, Select, Textarea, Modal, ConfirmDialog, Spinner, Skeleton, StatusBadge, EmptyState, ErrorState, Pagination, SectionHeading, StatCard, DataTable (table on md+, stacked cards below md).
- src/components/ServiceCard.tsx per the design spec.
- <Toaster /> in the root layout.
- Footer (all required content): logo "SalonBook" + short description; important navigation links (Home, Browse Services, Sign In, Sign Up); salon contact information (phone, email); salon address and opening hours; social media links (Facebook, Instagram, X/Twitter, YouTube icons that open in a new tab with rel="noopener noreferrer"); copyright with the current year.
- app/not-found.tsx (invalid routes), app/error.tsx, app/unauthorized/page.tsx (403).
Test: components render in a temporary /ui-kit page (delete it before committing); check 360px/768px/1280px.
Client commits: "chore: init next app with tailwind, daisyui salon theme and fonts", "feat: add reusable ui components, constants and api client skeleton", "feat: add responsive footer, not-found, error and unauthorized pages"
```

### STEP 3 — Client: Better Auth, Navbar, Sign In/Up, guards, admin seed (client commits 4–9)

```
Implement authentication in salonbook-client.

A) Better Auth config (src/lib/auth.ts, app/api/auth/[...all]/route.ts, src/lib/auth-client.ts)
- Cached MongoClient in src/lib/mongodb.ts; mongodbAdapter on the same database.
- baseURL = BETTER_AUTH_URL, secret = BETTER_AUTH_SECRET, trustedOrigins = [BETTER_AUTH_URL]. All secrets from env only.
- emailAndPassword enabled (minPasswordLength 6, autoSignIn true); Google social provider with env credentials.
- user.modelName = "users". additionalFields: role (string, default "customer", input:false), isBlocked (boolean, default false, input:false), phone (string, optional).
- Server-side password rule enforcement (one uppercase + one lowercase + min 6) with a hooks.before middleware on sign-up so API calls cannot bypass the UI.
- databaseHooks.session.create.before: look up the user; if isBlocked, refuse to create the session (blocked users cannot sign in with credentials OR Google).
- Plugins: jwt (short expiry, e.g. 15m; exposes /api/auth/jwks and token()), then nextCookies() last. Do NOT enable cookie cache for sessions (fresh role/isBlocked on every server check).
- authClient with jwtClient() and inferAdditionalFields.

B) Navbar (sticky h-16, mobile drawer)
- Logo/name "SalonBook". Signed out: Home, Browse Services, Sign In, Sign Up. Signed in: Home, Browse Services (the entry to the protected Salon/Service Details page), Dashboard, plus a profile dropdown with user name, Dashboard, Logout. Sign In/Sign Up are hidden when signed in.
- Uses authClient.useSession() so it updates immediately after login/logout/profile change (no reload). Show a skeleton while the session loads (no flash of wrong links).
- Dashboard link goes to the role dashboard. Logout calls signOut, toasts, and routes to /.

C) Sign Up (/signup)
- Fields: Full Name, Email, Password (live checklist: 6+ chars, 1 uppercase, 1 lowercase), Profile Image with a toggle "Upload" / "Image URL" (URL validated; upload goes to POST {API}/api/upload/public, available after Step 5; until then URL mode works). Google button.
- Success/error toasts. After sign-up redirect through /auth/callback.

D) Sign In (/signin)
- Fields: Email, Password; Google button; success/error toasts. Map ?error= from social login failures (including "blocked") to a readable toast/message.
- Honor ?redirect= ONLY if it is a relative path starting with "/" (prevents open redirects).

E) /auth/callback (server component)
- Reads the fresh session. Admin -> /dashboard/admin. Customer -> validated ?redirect or /dashboard/customer. No session -> /signin. Use this as callbackURL for credentials and Google flows.

F) Guards
- middleware (or proxy.ts, depending on the Next.js version): optimistic check with the session cookie for /dashboard/*, /services/*, /payment/* -> /signin?redirect=<path>.
- src/lib/session.ts: getSession() and requireRole(role) helpers used in app/dashboard/admin/layout.tsx, app/dashboard/customer/layout.tsx, app/services/[id]/page.tsx, payment pages. Rules: no session -> /signin?redirect=; isBlocked -> signOut + /signin?error=blocked; wrong role on a dashboard -> redirect to own dashboard. /dashboard redirects by role. Create minimal placeholder layouts/pages for every dashboard route in the ROUTE MAP so no link 404s (they get replaced in later steps).

G) Admin seed (scripts/seed-admin.ts, npm script "seed:admin", run with tsx and .env.local)
- Reads ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD from env. If the user does not exist, create it with auth.api.signUpEmail; then set role="admin" with a direct MongoDB update (role cannot be set through the API because of input:false). If it exists, just set role="admin". Idempotent. No credentials in code. The password must satisfy the password rules.

Test: sign up a customer with email and with Google; wrong password toast; password rules enforced even via a direct POST to /api/auth/sign-up/email; seed admin and sign in -> /dashboard/admin; customer opening /dashboard/admin is redirected to /dashboard/customer; signed-out /services/123 -> /signin?redirect=/services/123 and returns there after login; navbar updates without reload; in MongoDB the collection is named "users".
Client commits: "feat: configure better auth with google, jwt plugin and users collection", "feat: add auth-aware navbar with profile dropdown", "feat: add sign up page with validation and image upload or url", "feat: add sign in page and role based auth callback", "feat: add route guards with server-side role and blocked checks", "feat: add idempotent admin seed script"
```

### STEP 4 — Server: models and indexes (server commit 3)

```
Create Mongoose models using the DATA MODEL in Section 0:
- User: a minimal model bound to the existing "users" collection (strict:false, never recreate it). Better Auth stores the id as ObjectId _id; JWT "sub" is its string form, so convert with new Types.ObjectId(sub).
- Service, Appointment, Transaction with timestamps, enums, validators (price > 0, duration > 0, category in CATEGORIES, timeSlot in TIME_SLOTS).
- Appointment: refs serviceId -> Service, customerId -> User. UNIQUE PARTIAL index on { appointmentDate:1, timeSlot:1 } with partialFilterExpression { status: { $in: ["pending","confirmed"] } } -> prevents duplicate active appointments for the same date and time slot (the docx rule); cancelled appointments free the slot. (Requires MongoDB 6.0+, which Atlas provides.) Add a code-level pre-check too for a friendly message.
- Transaction: UNIQUE index on stripeSessionId. Service: indexes on status, category, price, serviceName.
- scripts/syncIndexes.ts + npm script "db:indexes" (calls syncIndexes on every model). Serverless auto-indexing is unreliable, so this is run manually against dev and later against production.
Test: run db:indexes; inserting two active appointments with the same date+slot fails with a duplicate key error; a cancelled one does not block.
Server commit: "feat: add service, appointment and transaction models with indexes"
```

### STEP 5 — Server: JWT/role/blocked middleware, profile read, image upload (+ client token wiring) (server commits 4–6, client commit 10)

```
SERVER
- middleware/verifyJWT: read "Authorization: Bearer <token>", verify with jose using createRemoteJWKSet(new URL(`${BETTER_AUTH_URL}/api/auth/jwks`)), checking signature, expiry, issuer and audience (Better Auth defaults to the base URL; confirm in the installed version). Missing/invalid/expired -> 401 JSON. Attach userId (from "sub").
- middleware/loadUser: fetch the user from MongoDB by id; not found -> 401; isBlocked -> 403 "Your account has been blocked". Attach req.user (id, role, name, email).
- middleware/requireRole(role). Export composed guards: auth (verifyJWT + loadUser), adminOnly (auth + requireRole("admin")), customerOnly (auth + requireRole("customer")). Role always from the DB.
- GET /api/profile (auth): returns the current user without sensitive fields.
- Image upload: multer memory storage, only jpeg/png/webp, max 5MB, forward to ImgBB (key from env), return { url }. Clear errors for wrong type, too large, and ImgBB failure.
  * POST /api/upload/image (auth required) — dashboard use.
  * POST /api/upload/public — used by the sign-up form (the user does not exist yet); tight express-rate-limit (e.g. 10 requests / 15 min / IP), same file validation.
CLIENT
- Finish src/lib/api.ts: get the JWT with authClient.token(), cache it until ~60s before expiry, attach "Authorization: Bearer"; on 401 fetch a fresh token and retry once, then sign out and redirect to /signin; on 403 with a blocked message sign out and redirect to /signin?error=blocked; throw typed errors with the server message for toasts. Add uploadImage(file, {public}) helper with size/type pre-checks and toast on failure. Wire it into the sign-up form's upload mode.
Test: from the signed-in browser call the API client for GET /api/profile (200); curl with no token (401), tampered token (401), expired token (401); manually set isBlocked=true in Mongo -> 403; sign-up upload returns an ImgBB URL; a 6MB file and a .pdf are rejected with clear toasts.
Server commits: "feat: add jwt verification middleware using better auth jwks", "feat: add role based authorization and blocked user guard", "feat: add profile read and imgbb image upload endpoints"
Client commit: "feat: attach jwt to api requests and wire sign up image upload"
```

---

## PHASE 2 — SERVICES

### STEP 6 — Server: Services API (server commits 7–8)

```
Public (no auth):
- GET /api/services?search=&category=&sort=price_asc|price_desc|newest&page=&limit= : ACTIVE services only; case-insensitive search on serviceName (regex-escaped); category must be in CATEGORIES; default sort newest; returns { items, total, page, pages }.
- GET /api/services/featured?limit=6 : active services, newest first (limit min 6 default 6).
- GET /api/services/categories : all 7 CATEGORIES with the count of ACTIVE services each.
Protected:
- GET /api/services/:id (auth): invalid ObjectId -> 400 "Invalid service id"; not found -> 404 "Service not found"; non-admin requesting an inactive service -> returns it with status "inactive" so the page can show "currently unavailable" (admin sees all).
Admin (router.use("/admin", auth, adminOnly)):
- GET /api/admin/services (all statuses, search + category + status filter + pagination)
- POST /api/admin/services, PATCH /api/admin/services/:id, DELETE /api/admin/services/:id, PATCH /api/admin/services/:id/status
- zod .strict(): serviceName, category in CATEGORIES, description, price > 0, duration > 0 (integer minutes), image required on create and must be an https URL on the ImgBB host (so the image came from an upload), status active|inactive default active.
- Define /featured and /categories BEFORE /:id so they are not captured.
- Deleting a service that has appointments: block with 409 "Service has appointments; deactivate it instead" (keeps references valid).
Test with curl/Postman: customer token on /api/admin/* -> 403; price 0 and duration -5 -> 400; unknown body key -> 400; inactive service not in public list.
Server commits: "feat: add public services endpoints with search, category filter, sort and pagination", "feat: add admin service management endpoints with validation"
```

### STEP 7 — Client: dashboard shell + Admin Manage Services + Add/Update Service (client commits 11–14)

```
Dashboard shell:
- app/dashboard/layout shell: sidebar (fixed on lg+, drawer below lg) + top bar (hamburger, user name/avatar, logout) + main content area, with role-based nav built from one config. Admin nav: Overview, Manage Services, Add Service, Manage Appointments, Manage Users, Transactions, My Profile. Customer nav: Overview, My Appointments, My Profile. Active link highlight. Logo links to /.
Admin Manage Services (/dashboard/admin/services):
- DataTable of ALL services: image, name, category, price, duration, status badge, actions. Search by name + category filter + pagination. Activate/Deactivate toggle (instant, with toast), Edit (link), Delete (ConfirmDialog -> toast; show the 409 message if blocked). Skeleton loader while fetching, empty state, error state with retry.
Add / Update Service (/dashboard/admin/services/new and /[id]/edit, one shared form component):
- Fields: Service Name, Category (select), Description, Price, Estimated Duration (minutes), Service Image (FILE UPLOAD ONLY — no URL field — with preview, type/size validation, upload progress/spinner, error toast on failure; edit mode shows the current image and allows replacing it), Service Status (Active/Inactive, default Active).
- react-hook-form + zod: price > 0 and duration > 0 (positive integer minutes) with inline errors. Submit button loading state; success toast and redirect to the list. Invalid id in edit shows an error state.
Test: create 12 services across all 7 categories with real uploaded images (keep 2 inactive); edit; toggle; delete; mobile layout at 360px.
Client commits: "feat: add dashboard layout with role based sidebar and top bar", "feat: add admin manage services table with search, filter and status toggle", "feat: add service form with image upload for create and update", "feat: add service delete confirmation and error states"
```

### STEP 8 — Client: Home page (client commits 15–17)

```
Build / (public). All dynamic sections fetch from the API with skeletons and error states with a retry button.
1) Banner: salon-themed background image stored locally in /public (optimized, with next/image priority; free-to-use photo, no hotlinking) with dark overlay; Title, Short Description, CTA button "Explore Salon Services" -> /services.
2) Dynamic Section 1 — Featured Salon Services: at least 6 ACTIVE services from the database in a ServiceCard grid (image, name, category, price, duration, short description, View Details). "View all services" link.
3) Dynamic Section 2 — Salon Service Categories: all 7 categories from /api/services/categories as cards with a lucide icon, name and service count; clicking goes to /services?category=<name>.
4) Additional section (my own idea): "Why Choose SalonBook" (4 value points with icons) followed by a "How It Works" 4-step strip: Browse -> Request -> Get Confirmed -> Pay Securely.
View Details on a card goes to /services/[id] (redirects to Sign In if signed out, then returns).
Test: 6+ cards appear; inactive services never appear; category tile filters Browse page; Lighthouse-style check for layout shift on the hero; 360/768/1280px.
Client commits: "feat: add home banner with salon theme and cta", "feat: add featured services and service categories sections", "feat: add why choose us and how it works sections"
```

### STEP 9 — Client: Browse Services (client commits 18–19)

```
Build /services (public, no login needed).
- Responsive ServiceCard grid of ACTIVE services from the API.
- Search by service name (debounced 400ms), Category filter (chips or select, includes "All"), Sort by price (Default/Newest, Price: Low to High, Price: High to Low), Reset filters button, result count.
- All filters/sort/page stored in URL query params (?search=&category=&sort=&page=) so refresh and shared links work; reading params works with Suspense where required by Next.js.
- Pagination, skeleton grid while loading, empty state ("No services found") and error state with retry.
Test: each control individually and combined; refresh keeps filters; ?category=Makeup from the Home tiles works; signed-out user can browse.
Client commits: "feat: add browse services page with responsive card grid", "feat: add name search, category filter, price sorting and url synced filters"
```

---

## PHASE 3 — APPOINTMENTS

### STEP 10 — Server: Appointments API (server commits 9–10)

```
Customer (customerOnly):
- POST /api/appointments { serviceId, appointmentDate "YYYY-MM-DD", timeSlot, message? }. Rules: valid ObjectId; service exists (404) and is ACTIVE (400 "This service is not available for booking"); date is today or later in SALON_TIMEZONE; timeSlot in TIME_SLOTS; message max 500 chars; snapshot servicePrice from the service; status "pending", paymentStatus "unpaid" (never taken from the body); duplicate active appointment for the same date + time slot -> 409 "This time slot is already booked, please choose another" (pre-check AND unique-index duplicate-key fallback).
- GET /api/appointments/availability?date=YYYY-MM-DD (auth): returns the list of timeSlots already taken by pending/confirmed appointments that day (slot strings only, no personal data) so the form can disable them.
- GET /api/appointments/my?status=&page= : own appointments only, populated with service { serviceName, image, category, duration }, newest first.
- GET /api/appointments/my/stats : { total, pending, confirmed, cancelled }.
- GET /api/appointments/:id : own only (404 for others), includes the related paid transaction (amount, currency, date) if any, for "payment history".
- PATCH /api/appointments/:id/cancel : own only AND status must be "pending", else 400 "Only pending appointments can be cancelled".
Admins calling the customer-only create endpoint -> 403 "Admins cannot book appointments".
Admin (router.use("/admin", auth, adminOnly)):
- GET /api/admin/appointments?status=&page= : populated customer { name, email, phone, image } and service { serviceName, image, category, price }.
- GET /api/admin/appointments/:id
- PATCH /api/admin/appointments/:id/confirm : only "pending", else 400.
- PATCH /api/admin/appointments/:id/cancel : "pending" or "confirmed", else 400.
No endpoint accepts paymentStatus or servicePrice from the client.
Test: booking inactive service -> 400; duplicate slot -> 409; second customer cannot read/cancel the first customer's appointment; cancel confirmed -> 400; admin confirm on non-pending -> 400; customer token on admin routes -> 403.
Server commits: "feat: add customer appointment booking, availability and listing endpoints", "feat: add admin appointment review, confirm and cancel endpoints"
```

### STEP 11 — Client: protected Service (Salon) Details page + booking form (client commits 20–21)

```
Build /services/[id] (private; redirect to /signin?redirect=/services/<id> when signed out, enforced server-side in the page).
- Display: Service Name, Service Image, Category, Description, Price, Estimated Duration, and the Appointment Booking Option (a "Book Appointment" button that reveals/focuses the appointment form on the page).
- Invalid or unknown id -> friendly error state ("Service not found") with a Back to Services button (handle 400 and 404).
- Admin viewing: show an info notice "Admins cannot submit appointment requests" and no form.
- Inactive service: badge "Currently unavailable" and a disabled booking button/form.
- Customer form (react-hook-form + zod): Appointment Date (min = today), Available Time Slot (select from TIME_SLOTS; after choosing a date fetch /api/appointments/availability and disable taken slots), Additional Message (optional, 500 chars). Submit shows a loader ("Creating appointment request..."), success toast + redirect to /dashboard/customer/appointments; a 409 conflict shows a clear toast and refreshes the availability; other errors show the server message.
Test: all the rules above plus a guest being redirected and returned after sign-in.
Client commits: "feat: add protected service details page with invalid id and role states", "feat: add appointment booking form with availability and conflict handling"
```

### STEP 12 — Client: Customer dashboard (Overview + My Appointments) and Admin Manage Appointments (client commits 22–25)

```
Customer Overview (/dashboard/customer): 4 StatCards — Total Appointment Requests, Pending, Confirmed, Cancelled (from /api/appointments/my/stats) with skeleton loaders.
My Appointments (/dashboard/customer/appointments): DataTable of the logged-in customer's appointments showing Service Name + Image, Category, Appointment Date, Appointment Time, Service Price, Appointment Status badge, Payment Status badge, Request Date. Status filter + pagination. Actions:
- View Details (Modal with all fields, message, and for paid appointments the payment info: amount, currency, paid date).
- Cancel: shown/enabled ONLY for pending; ConfirmDialog; success toast; list refreshes.
- Pay Now: rendered ONLY for confirmed + unpaid (handler wired in Step 14). Hidden for pending/cancelled. Paid shows a "Paid" badge.
Admin Manage Appointments (/dashboard/admin/appointments): DataTable of ALL appointments with Customer Information (name, email, phone), Service Information (name, image, category), Appointment Date and Time, Customer Message (if provided), Service Price, Appointment Status, Payment Status, Booking Request Date. Status filter + pagination. Actions: View Details (Modal), Confirm (only pending), Cancel (pending or confirmed), both with ConfirmDialog and toasts.
Test: the customer sees only their own rows; buttons appear/disappear exactly per rule; admin confirm/cancel update the customer's view; mobile card layout.
Client commits: "feat: add customer dashboard overview with appointment stats", "feat: add customer my appointments with details and cancel", "feat: add admin manage appointments table with details modal", "feat: add admin confirm and cancel appointment actions"
```

---

## PHASE 4 — PAYMENTS

### STEP 13 — Server: Stripe Checkout, verified webhook, transactions (server commits 11–13)

```
- POST /api/payments/create-checkout-session { appointmentId } (customerOnly): appointment must belong to the caller, status === "confirmed" and paymentStatus === "unpaid", else 400 ("Only confirmed, unpaid appointments can be paid"). Create a Stripe Checkout Session: mode "payment", currency "usd", one line item (product name = service name, unit_amount = Math.round(servicePrice * 100)), metadata { appointmentId, customerId }, client_reference_id = appointmentId, success_url = `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url = `${CLIENT_URL}/payment/cancel`. Return { url }. The price always comes from the DB, never the client.
- POST /api/webhooks/stripe — registered in app.ts BEFORE express.json() with express.raw({ type: "application/json" }). Verify with stripe.webhooks.constructEvent(rawBody, stripe-signature header, STRIPE_WEBHOOK_SECRET); invalid signature -> 400.
  * checkout.session.completed with payment_status === "paid": load the appointment from metadata; confirm session customer metadata matches the appointment's customerId, amount_total === Math.round(servicePrice*100) and currency matches; then idempotently upsert the transaction by stripeSessionId ($setOnInsert: appointmentId, customerId, amount = amount_total/100, currency, stripeSessionId, status "paid") and set appointment.paymentStatus = "paid" with updateOne({ _id, paymentStatus: "unpaid" }). Replayed events must not create duplicates.
  * checkout.session.expired and checkout.session.async_payment_failed: upsert a transaction with status "failed" (appointment stays "unpaid"; the customer can pay again with a new session).
  * Any other event: respond 200 and ignore.
  * Return 200 after successful processing; on unexpected/transient errors return 500 so Stripe retries (processing is idempotent). Log without secrets.
- GET /api/payments/session/:sessionId (customerOnly, READ-ONLY): retrieve the session from Stripe only to check that metadata.customerId equals the caller (else 403); then return { confirmed: boolean (a paid transaction exists in the DB), amount, currency, appointment summary }. It must NEVER write paymentStatus. Until the webhook has run it returns confirmed:false.
- GET /api/admin/transactions?status=&page= (adminOnly): populated customer { name, email }, appointment { appointmentDate, timeSlot } and service name, amount, currency, stripeSessionId, status, createdAt. There is NO endpoint to create, edit or delete transactions or to set paymentStatus manually.
Test with Stripe CLI: stripe listen --forward-to localhost:5000/api/webhooks/stripe; pay with 4242 4242 4242 4242 -> appointment becomes paid and exactly one transaction exists; stripe events resend (replay) -> still one; bad signature -> 400; try paying a pending/cancelled/paid appointment -> 400; another customer's appointment -> 404/403; use the failing test card/expired session to see a "failed" transaction.
Server commits: "feat: add stripe checkout session endpoint for confirmed appointments", "feat: add verified stripe webhook with idempotent payment and failed transaction handling", "feat: add read-only payment session status and admin transactions endpoints"
```

### STEP 14 — Client: Pay Now flow, success/cancel pages, Admin Transactions (client commits 26–28)

```
- Pay Now (My Appointments): button shows a spinner ("Redirecting to payment...") while calling create-checkout-session, then window.location = url. Errors -> toast and the button recovers.
- /payment/success (private, customer): reads ?session_id; if missing show an error state. Calls the read-only status endpoint. If confirmed:false show "Confirming your payment..." with a spinner and poll every 2s up to ~30s (the webhook may arrive slightly later); then show a confirmation (amount, currency, service, date/time, "Payment received") with buttons to My Appointments / Home. If still unconfirmed after the timeout: neutral message "Your payment is being processed; it will appear in My Appointments shortly". This page NEVER marks anything as paid itself.
- /payment/cancel (private): friendly "Payment cancelled" message, appointment stays unpaid, buttons: Back to My Appointments, Try again.
- Admin Transactions (/dashboard/admin/transactions): read-only DataTable showing Customer Information, Related Service, Appointment Date, Payment Amount, Currency, Stripe Checkout Session ID (shortened, e.g. cs_test_…a1b2c3, with a copy button), Payment Status badge (paid/failed), Transaction Date; status filter + pagination. No edit/delete controls anywhere.
Test: the full flow end to end locally with the Stripe CLI forwarding; cancel flow; refreshing the success page; transaction visible to admin.
Client commits: "feat: add pay now stripe checkout redirect", "feat: add payment success page with webhook confirmation polling and cancel page", "feat: add admin read-only transactions page"
```

---

## PHASE 5 — USERS, PROFILE, OVERVIEW

### STEP 15 — Server: profile update, user management, admin stats (server commit 14–15)

```
- PATCH /api/profile (auth): zod .strict() whitelist name (2–60 chars), image (https URL), phone (optional, simple phone regex). Any other key (role, isBlocked, email, id, ...) is rejected with 400. Always updates ONLY the authenticated user (id from the JWT/DB, never from the body or URL), so nobody can update another user.
Admin (router.use("/admin", auth, adminOnly)):
- GET /api/admin/users?search=&page= : registered customers (role "customer") with name, email, phone, image, isBlocked, createdAt.
- GET /api/admin/users/:id : details + that customer's appointment counts.
- PATCH /api/admin/users/:id/block and /unblock : cannot target an admin or yourself. On block, also delete that user's documents in Better Auth's session collection (check how userId is stored) so existing logins stop working immediately.
- GET /api/admin/stats : totalCustomers, totalActiveServices, totalAppointments, pendingAppointments, confirmedAppointments, totalSuccessfulPayments (count of transactions with status "paid").
Test: PATCH /api/profile with { role:"admin" } -> 400; blocked user's next API call -> 403 and cannot sign in again; stats numbers match the database.
Server commits: "feat: add whitelisted profile update endpoint", "feat: add admin user block, unblock and stats endpoints"
```

### STEP 16 — Client: Manage Users, My Profile, Admin Overview (client commits 29–31)

```
- Manage Users (/dashboard/admin/users): list of registered customers (avatar, name, email, phone, status badge Active/Blocked, joined date), search + pagination, View Details (Modal), Block/Unblock with ConfirmDialog and toasts.
- My Profile (/dashboard/customer/profile and /dashboard/admin/profile — one shared component): update Name, Profile Image (toggle Upload / Image URL, with preview), Phone; Email shown read-only; no role/blocked controls. Success/error toasts; after saving, refresh the session so the navbar and sidebar show the new name/image immediately (no reload).
- Admin Overview (/dashboard/admin): 6 StatCards — Total Registered Customers, Total Active Services, Total Appointment Requests, Pending Appointments, Confirmed Appointments, Total Successful Payments (from /api/admin/stats), skeleton loader while loading.
Test: block a customer -> that customer is signed out/blocked on the next action and cannot sign in; unblock -> works again; profile image upload failure shows a toast; admin overview numbers match.
Client commits: "feat: add admin manage users with block and unblock", "feat: add shared profile management page with image upload", "feat: add admin overview statistics"
```

---

## PHASE 6 — POLISH, DOCS, DEPLOY, QA

### STEP 17 — Client + Server: error handling, loaders, accessibility, responsive pass (client commits 32–33, server commit 16)

```
CLIENT
- Verify and complete: loaders for fetching services, dashboard data, creating appointment requests, processing payments; error handling for invalid routes, failed API requests (retry), invalid form submissions (inline errors + toast), unauthorized access (403 page), failed image uploads, appointment booking conflicts, failed or cancelled payments. No alert() anywhere (grep for it).
- Accessibility: labels on all inputs, alt text, focus states, aria-labels on icon buttons, contrast, keyboard-closable modals.
- Responsive audit at 360px, 768px, 1280px for every page; no horizontal page scroll; every button and link works (click through the whole sitemap). Remove unused code, unused env variables and console logs.
SERVER
- Review every route for guards (list all routes with their middleware in a table), consistent JSON error shape, correct status codes, and that no secret is logged.
Client commits: "feat: complete loading and error states across all pages", "style: responsive and accessibility polish"
Server commit: "refactor: audit route guards and error responses"
```

### STEP 18 — READMEs (client commit 34, server commit 17)

```
Write README.md in BOTH repos with these sections: Project Name and Description; Important Features; Technology Stack; Installation Instructions; How to Run the Project Locally (incl. Stripe CLI command for the webhook, db:indexes, seed:admin); Required Environment Variables (NAMES only, never values — use the per-repo lists in Section 0); Live Website Link; Client and Server Repository Links. The server README also has an API route table (method, path, access role). Do not put secrets or the admin password in READMEs.
Client commit: "docs: add client readme"
Server commit: "docs: add server readme with api routes and env names"
```

### STEP 19 — Deployment (client commit 35, server commit 18)

```
Deploy in this order and verify at each stage.
1. MongoDB Atlas: Network Access allows Vercel (0.0.0.0/0 for the assignment); one database user for the app. Use the SAME database name in both MONGODB_URI values.
2. Deploy salonbook-server to Vercel with all server env vars. GET /api/health works on the live URL.
3. Deploy salonbook-client to Vercel with the client env vars: BETTER_AUTH_URL = the client's live URL, NEXT_PUBLIC_API_URL = the server's live URL, BETTER_AUTH_SECRET, Google credentials, MONGODB_URI.
4. Set server env CLIENT_URL and BETTER_AUTH_URL to the client's live URL (no trailing slash); redeploy the server.
5. Google Cloud Console: add the live origin and the redirect URI https://<client-live-url>/api/auth/callback/google (keep the localhost one for development).
6. Stripe Dashboard (test mode): add a webhook endpoint https://<server-live-url>/api/webhooks/stripe for checkout.session.completed, checkout.session.expired, checkout.session.async_payment_failed; copy the signing secret into the server STRIPE_WEBHOOK_SECRET; redeploy. Confirm in the Stripe dashboard that deliveries return 200 (this also proves raw-body signature verification works on Vercel).
7. Locally, with the PRODUCTION MONGODB_URI in .env.local, run once: npm run db:indexes (server) and npm run seed:admin (client). Sign in on the live site with those admin credentials.
8. As admin on the live site create 12 services across all 7 categories with uploaded images (2 inactive) and one test customer account.
9. Fix anything that fails: CORS, 404/504 on reload, session lost after refresh, images not loading (next.config remotePatterns), cold-start timeouts.
Commits (only if files changed): client "chore: production configuration and deployment fixes", server "chore: production configuration and deployment fixes"
```

### STEP 20 — Final QA (run every item; fix every FAIL; report PASS/FAIL)

```
AUTH & SECURITY
[ ] Sign up works with email and with Google; redirects by role; success/error toasts
[ ] Password rules (6+, upper, lower) enforced in the UI AND by a direct POST to /api/auth/sign-up/email
[ ] No way to create an admin via sign-up (try sending role:"admin" in the sign-up body)
[ ] Seeded admin signs in on the LIVE site and lands on /dashboard/admin
[ ] Customer opening /dashboard/admin/* is redirected; admin opening /dashboard/customer/* is redirected
[ ] Customer calling any /api/admin/* with Postman -> 403; no token -> 401; tampered token -> 401
[ ] Blocked user: cannot sign in (credentials and Google), existing session stops working, API returns 403
[ ] PATCH /api/profile with role/isBlocked/email -> 400; cannot update another user
[ ] No .env in git history: run `git log --all --full-history -- "*.env*"` and a secret grep (sk_, whsec_, mongodb+srv) over the repo and the built client bundle
[ ] Stripe and ImgBB keys appear nowhere in the client repo

FEATURES
[ ] Home: banner + CTA; >= 6 featured ACTIVE services; 7 dynamic categories that link to filtered Browse; extra section present
[ ] Browse: public; search by name; category filter; price sort asc/desc; URL params survive refresh
[ ] /services/[id]: protected; invalid id -> error state; admin sees notice and no form; inactive -> unavailable
[ ] Booking: only authenticated customers; inactive blocked; same date + time slot as an active appointment -> 409 and slot disabled in the UI; cancelled appointment frees the slot
[ ] Customer sees only their own appointments; cancels only pending; cannot cancel confirmed/cancelled; Pay Now only for confirmed+unpaid
[ ] Admin confirms only pending; cancels pending/confirmed; sees all appointments with customer + service info
[ ] Admin service CRUD + activate/deactivate + image upload (file only); price/duration must be positive; only admin can mutate
[ ] Stripe test card 4242 4242 4242 4242 on the LIVE site -> success page -> appointment paymentStatus becomes paid ONLY after the webhook; exactly one transaction; resend event -> no duplicate
[ ] Cancelled checkout -> /payment/cancel and appointment still unpaid
[ ] Admin Transactions page shows all required columns and has no edit controls; no API can mark a payment paid manually
[ ] Navbar updates instantly on login/logout/profile edit; footer has all 6 required content groups
[ ] Toasts everywhere, no alert(); loaders for services/dashboard/booking/payment

DEPLOYMENT
[ ] Reload (F5) on every route: public, dynamic /services/[id], every dashboard page, payment pages -> no 404/504
[ ] Session persists after refresh and after closing/reopening the tab
[ ] No CORS errors in the browser console on any page
[ ] Responsive at 360/768/1280px; no horizontal scroll; every link/button works

GIT
[ ] `git rev-list --count HEAD` >= 20 in client and >= 12 in server; messages meaningful; repos separate; READMEs complete
```

### STEP 21 — Submission pack

```
Prepare the submission block exactly as required:
- Admin Email
- Admin Password
- Live Site Link
- GitHub Repository (Server)
- GitHub Repository (Client)
Then write a 60-second demo script (the exact click path for: customer books -> admin confirms -> customer pays with the test card -> admin sees the transaction) and a checklist of the test accounts and test card to include in my notes.
```

---

## TRACEABILITY MATRIX — every requirement in the docx -> where it is delivered

| Docx requirement | Delivered in |
|---|---|
| Customer: browse, search by name, filter by category, view details, request, status, cancel pending, pay confirmed, history, dashboard | Steps 6, 8, 9, 10, 11, 12, 14 |
| Admin: manage services (add/update/delete, upload images), view all requests, confirm/cancel, manage customers, view transactions, dashboard | Steps 6, 7, 10, 12, 13, 14, 15, 16 |
| Tech stack (Next.js, TS, Node, Express, MongoDB/Mongoose, REST, JWT, Stripe, ImgBB) | Section 0, Steps 1–5 |
| 20+ client / 12+ server meaningful commits, separate repos, READMEs | Section 0 rule 2–3; commits in every step (34 client, 17 server planned, +1 each if deployment fixes are needed); Steps 18, 20 |
| Secure Better Auth, MongoDB, Stripe, Google, ImgBB via env; never push .env | Section 0 env block; Steps 1, 3; QA in Step 20 |
| Fully responsive, professional UI/UX, reusable components, no unnecessary animation | Design system in Section 0; Steps 2, 17 |
| Proper error handling; server-side role verification on all protected APIs | Section 0 security model; Steps 1, 5, 17 |
| Payment status updated only after verified Stripe webhook | Step 13 (and Section 0) |
| No reload issues; deployment guideline (CORS, 404, 504, private routes after refresh, stay authenticated, live Stripe + webhook, admin credentials work) | Steps 3, 19, 20 |
| README requirements (all 8 items) | Step 18 |
| Navbar (logo, public/auth routes, profile dropdown, updates immediately) | Step 3B |
| Footer (6 content groups) | Step 2 |
| Public pages / private pages / customer + admin dashboard pages; no cross-role URL access | Section 0 route map; Steps 3F, 7, 8, 9, 11, 12, 14, 16 |
| Home: banner, featured >= 6 active services, categories, extra section | Step 8 |
| Browse: card layout, search, filter, price sort | Step 9 |
| Service Details: fields, invalid id error, only active bookable, admin cannot book, auth required | Steps 6, 10, 11 |
| Auth: Better Auth, sign up fields + password rules, Google, messages, redirects, no public admin | Step 3 |
| Sign in: credentials, Google, messages, role redirect | Step 3 |
| Protected routes + blocked users + server role verification | Steps 3F, 5, 15 |
| Dashboard layout with sidebar, role-based navigation | Step 7 |
| Customer overview (4 stats), My Appointments (all fields + actions + rules) | Steps 10, 12 |
| Admin overview (6 stats) | Steps 15, 16 |
| Manage Services + Add/Update (fields, upload not URL, positive price/duration, default active) | Steps 6, 7 |
| Manage Appointments (fields, only pending confirmable, cancel pending/confirmed) | Steps 10, 12 |
| Manage Users (view, details, block, unblock) | Steps 15, 16 |
| Transactions (all columns, no manual edits) | Steps 13, 14 |
| Appointment booking form + defaults + all rules (incl. duplicate date+slot) | Steps 4, 10, 11 |
| Payment flow (Pay Now -> Checkout -> success/cancel -> webhook saves transaction) | Steps 13, 14 |
| Profile management (name, image upload/URL, phone; no role/blocked change; not others' profile) | Steps 15, 16 |
| Loading states, error handling list, toast notifications, no alert() | Section 0 rule 6; Steps 2, 17 |
| UI + dashboard UI requirements | Design system; Steps 2, 7, 17 |
| Challenge: search, JWT middleware, price sorting | Steps 9, 5, 6/9 |
| Database architecture (users, services, appointments, transactions, references, no extra collections) | Section 0 data model; Step 4 |
| Final guidelines / Before submitting tests | Steps 5, 6, 10, 13, 19, 20 |
| What to submit | Step 21 |

---

### Decisions worth knowing (and how to change them)
- **Duplicate slot rule** follows the docx literally: one active appointment per date + time slot for the whole salon. If your evaluator instead expects one booking per slot per service, add `serviceId` to the unique index in Step 4 and to the availability query in Step 10.
- **Better Auth runs in the Next.js app**, and Express verifies its JWT through the JWKS endpoint. This avoids cross-domain cookie problems between two Vercel domains while still meeting "JWT verification middleware on the Express backend".
- **Payments are USD** in Stripe test mode. Amounts are stored in major units (e.g. 45.00).
- **Deleting a service that has appointments is blocked** (deactivate instead) so references never break.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
