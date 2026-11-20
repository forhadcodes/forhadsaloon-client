import { AUTH_MESSAGES } from "@/lib/constants"

type AuthErrorLike = {
  code?: string
  message?: string
} | null

/**
 * Better Auth returns machine codes; translate the ones users can actually
 * act on into plain language instead of showing raw API wording.
 */
export function getAuthErrorMessage(error: AuthErrorLike, fallback: string) {
  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_CREDENTIALS":
      return AUTH_MESSAGES.invalidCredentials
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return AUTH_MESSAGES.emailTaken
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return AUTH_MESSAGES.passwordLength
    case "BANNED_USER":
    case "FORBIDDEN":
      return AUTH_MESSAGES.blocked
    default:
      return error?.message || fallback
  }
}
