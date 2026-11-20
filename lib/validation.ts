/** Shared password rules — must match the server hook in lib/auth.ts. */
export const PASSWORD_RULES = [
  { label: "6+ characters", test: (value: string) => value.length >= 6 },
  { label: "one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "one lowercase letter", test: (value: string) => /[a-z]/.test(value) },
] as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const IMAGE_PATTERN = /^https?:\/\/\S+$/i

export function validateEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim()) ? null : "Enter a valid email address."
}

export function validatePassword(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value))
    ? null
    : "Password must have 6+ characters, one uppercase and one lowercase letter."
}

export function validateRequired(value: string, label: string) {
  return value.trim() ? null : `${label} is required.`
}

export function validateImageUrl(value: string) {
  if (!value.trim()) return null
  return IMAGE_PATTERN.test(value.trim()) ? null : "Enter a valid image URL."
}

export function getMissingPasswordRules(value: string) {
  return PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.label)
}
