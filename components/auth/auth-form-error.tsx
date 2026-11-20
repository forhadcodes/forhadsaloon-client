import { cn } from "@/lib/utils"

type AuthFormErrorProps = {
  message?: string | null
  className?: string
}

/** Inline error shared by both auth forms (toasts are easy to miss). */
export function AuthFormError({ message, className }: AuthFormErrorProps) {
  if (!message) return null

  return (
    <p
      role="alert"
      className={cn(
        "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className
      )}
    >
      {message}
    </p>
  )
}
