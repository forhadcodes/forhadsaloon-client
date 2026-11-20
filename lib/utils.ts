export { cn } from "cn"

import { SALON_TIMEZONE } from "@/lib/constants"

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
/** Appointment dates are stored at UTC midnight; they are dates, not instants. */
const UTC_MIDNIGHT = /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/

export function formatDate(value: string | Date): string {
  const isDateOnly =
    typeof value === "string" && (DATE_ONLY.test(value) || UTC_MIDNIGHT.test(value))
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // Date-only values must stay in UTC or they shift a day in Asia/Dhaka.
    // Real timestamps (createdAt, paid date) must render in the salon timezone.
    timeZone: isDateOnly ? "UTC" : SALON_TIMEZONE,
  }).format(date)
}
