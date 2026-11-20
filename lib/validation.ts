/**
 * Shared form validation. Kept framework-free so the same rules can be
 * reused by the Better Auth sign-up call once it is connected.
 */

export const PASSWORD_RULES = [
  // Mirrors `minPasswordLength` in lib/auth.ts.
  { label: "at least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "one lowercase letter", test: (value: string) => /[a-z]/.test(value) },
] as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns an error message, or null when the value is valid. */
export function validateEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
    ? null
    : "Enter a valid email address."
}

export function validatePassword(value: string) {
  const missing = PASSWORD_RULES.filter((rule) => !rule.test(value))

  return missing.length === 0
    ? null
    : `Password needs ${missing.map((rule) => rule.label).join(", ")}.`
}

export function validateRequired(value: string, label: string) {
  return value.trim() ? null : `${label} is required.`
}
