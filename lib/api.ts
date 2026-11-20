import { authClient, signOut } from "@/lib/auth-client"
import { API_URL, ROUTES } from "@/lib/constants"
import type {
  AdminStats,
  Appointment,
  AppointmentStats,
  Paginated,
  PaymentSession,
  Service,
  ServiceCategoryCount,
  Transaction,
  UserSummary,
} from "@/lib/types"

export class ApiRequestError extends Error {
  readonly status: number
  readonly errors?: unknown

  constructor(status: number, message: string, errors?: unknown) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

type CachedToken = { token: string; expiresAt: number }

/** The jwt plugin endpoint returns `{ token }` only, so expiry comes from the JWT itself. */
let cachedToken: CachedToken | null = null

function decodeExpiry(token: string): number {
  try {
    const [, payload] = token.split(".")
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number
    }
    return typeof json.exp === "number" ? json.exp * 1000 : Date.now() + 5 * 60 * 1000
  } catch {
    return Date.now() + 5 * 60 * 1000
  }
}

export function clearTokenCache() {
  cachedToken = null
}

/**
 * Fetches the Better Auth JWT and keeps it until 60s before it expires.
 * Returns null when there is no session (public pages keep working).
 */
export async function getAuthToken(force = false): Promise<string | null> {
  if (!force && cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.token
  }

  try {
    const result = await authClient.$fetch<{ token?: string }>("/token")
    const token = result.data?.token
    if (result.error || !token) {
      cachedToken = null
      return null
    }

    cachedToken = { token, expiresAt: decodeExpiry(token) }
    return token
  } catch {
    cachedToken = null
    return null
  }
}

function redirectToSignIn(reason?: "blocked") {
  if (typeof window === "undefined") return

  const url = new URL(ROUTES.signIn, window.location.origin)
  if (reason) {
    url.searchParams.set("error", reason)
  } else {
    url.searchParams.set("redirect", `${window.location.pathname}${window.location.search}`)
  }
  window.location.assign(url.toString())
}

/** Session is gone or the account was blocked: drop the cookie and leave the page. */
async function endSession(reason?: "blocked") {
  clearTokenCache()
  await signOut().catch(() => undefined)
  redirectToSignIn(reason)
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  canRetry = true,
): Promise<T> {
  const token = await getAuthToken()

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      credentials: "omit",
    })
  } catch {
    if (options.signal?.aborted) throw new ApiRequestError(0, "Request cancelled.")
    throw new ApiRequestError(0, "Unable to reach the server. Please try again.")
  }

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean
    message?: string
    errors?: unknown
    data?: T
    items?: T
  }

  // Expired JWT: mint a fresh one once, then retry.
  if (response.status === 401 && token && canRetry) {
    clearTokenCache()
    const fresh = await getAuthToken(true)
    if (fresh) return request<T>(path, options, false)

    await endSession()
    throw new ApiRequestError(401, payload.message ?? "Your session has expired.")
  }

  if (response.status === 403 && /blocked/i.test(payload.message ?? "")) {
    await endSession("blocked")
    throw new ApiRequestError(403, payload.message ?? "Your account has been blocked.")
  }

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      payload.message ?? "Something went wrong. Please try again.",
      payload.errors,
    )
  }

  return (payload.data ?? payload.items ?? payload) as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) search.set(key, String(value))
  }
  const serialized = search.toString()
  return serialized ? `?${serialized}` : ""
}

/** Public + protected service reads. */
export const servicesApi = {
  list: (params: { search?: string; category?: string; sort?: string; page?: number; limit?: number }, signal?: AbortSignal) =>
    api.get<Paginated<Service>>(`/api/services${query(params)}`, signal),
  featured: (limit = 6, signal?: AbortSignal) =>
    api.get<{ items: Service[]; total: number }>(`/api/services/featured${query({ limit })}`, signal),
  categories: (signal?: AbortSignal) =>
    api.get<{ items: ServiceCategoryCount[] }>("/api/services/categories", signal),
  byId: (id: string, signal?: AbortSignal) => api.get<Service>(`/api/services/${id}`, signal),
}

export type CreateAppointmentInput = {
  serviceId: string
  appointmentDate: string
  timeSlot: string
  message?: string
}

/** Appointment endpoints (all require a signed-in user). */
export const appointmentsApi = {
  create: (input: CreateAppointmentInput) => api.post<Appointment>("/api/appointments", input),
  availability: (date: string, signal?: AbortSignal) =>
    api.get<{ date: string; availableSlots: string[]; takenSlots: string[] }>(
      `/api/appointments/availability${query({ date })}`,
      signal,
    ),
  my: (params: { status?: string; page?: number }, signal?: AbortSignal) =>
    api.get<Paginated<Appointment>>(`/api/appointments/my${query(params)}`, signal),
  stats: (signal?: AbortSignal) => api.get<AppointmentStats>("/api/appointments/my/stats", signal),
  byId: (id: string, signal?: AbortSignal) => api.get<Appointment>(`/api/appointments/${id}`, signal),
  cancel: (id: string) => api.patch<Appointment>(`/api/appointments/${id}/cancel`),
  adminList: (params: { status?: string; page?: number }, signal?: AbortSignal) =>
    api.get<Paginated<Appointment>>(`/api/admin/appointments${query(params)}`, signal),
  adminById: (id: string, signal?: AbortSignal) =>
    api.get<Appointment>(`/api/admin/appointments/${id}`, signal),
  adminConfirm: (id: string) => api.patch<Appointment>(`/api/admin/appointments/${id}/confirm`),
  adminCancel: (id: string) => api.patch<Appointment>(`/api/admin/appointments/${id}/cancel`),
}

/** Read-only payment status + Stripe checkout redirect. */
export const paymentsApi = {
  checkout: (appointmentId: string) =>
    api.post<{ url: string }>("/api/payments/create-checkout-session", { appointmentId }),
  session: (sessionId: string, signal?: AbortSignal) =>
    api.get<PaymentSession>(`/api/payments/session/${encodeURIComponent(sessionId)}`, signal),
  adminTransactions: (params: { status?: string; page?: number }, signal?: AbortSignal) =>
    api.get<Paginated<Transaction>>(`/api/admin/transactions${query(params)}`, signal),
}

export type UpdateProfileInput = { name?: string; image?: string; phone?: string }

/** Current user profile + admin management. */
export const profileApi = {
  get: (signal?: AbortSignal) => api.get<UserSummary>("/api/profile", signal),
  update: (input: UpdateProfileInput) => api.patch<UserSummary>("/api/profile", input),
  adminUsers: (params: { search?: string; page?: number }, signal?: AbortSignal) =>
    api.get<Paginated<UserSummary>>(`/api/admin/users${query(params)}`, signal),
  adminUser: (id: string, signal?: AbortSignal) =>
    api.get<UserSummary & { appointmentCounts?: AppointmentStats }>(
      `/api/admin/users/${id}`,
      signal,
    ),
  block: (id: string) => api.patch<{ id: string; isBlocked: boolean }>(`/api/admin/users/${id}/block`),
  unblock: (id: string) =>
    api.patch<{ id: string; isBlocked: boolean }>(`/api/admin/users/${id}/unblock`),
  stats: (signal?: AbortSignal) => api.get<AdminStats>("/api/admin/stats", signal),
}

export type ServiceInput = {
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status?: "active" | "inactive"
}

/** Admin service mutations. */
export const adminServicesApi = {
  list: (params: { search?: string; category?: string; status?: string; page?: number }, signal?: AbortSignal) =>
    api.get<Paginated<Service>>(`/api/admin/services${query(params)}`, signal),
  create: (input: ServiceInput) => api.post<Service>("/api/admin/services", input),
  update: (id: string, input: Partial<ServiceInput>) =>
    api.patch<Service>(`/api/admin/services/${id}`, input),
  setStatus: (id: string, status: "active" | "inactive") =>
    api.patch<Service>(`/api/admin/services/${id}/status`, { status }),
  delete: (id: string) => api.delete<{ id: string }>(`/api/admin/services/${id}`),
}
