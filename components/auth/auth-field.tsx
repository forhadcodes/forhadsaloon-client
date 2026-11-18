import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AuthFieldProps = ComponentProps<typeof Input> & {
  id: string
  label: string
  /** Validation message shown under the field. */
  error?: string
  /** Helper text shown when there is no error. */
  hint?: string
}

/**
 * Label + input + message in one component, so every auth field keeps the
 * same spacing and accessibility wiring without repetition.
 */
export function AuthField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: AuthFieldProps) {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        className={cn("h-11 rounded-lg px-3", className)}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
