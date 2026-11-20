import { API_URL } from "@/lib/constants"

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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      credentials: "omit",
    })
  } catch {
    throw new ApiRequestError(0, "Unable to reach the server. Please try again.")
  }

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean
    message?: string
    errors?: unknown
    data?: T
    items?: T
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
