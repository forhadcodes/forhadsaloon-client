import * as React from "react"
import { cn } from "@/lib/utils"

type SelectProps = React.ComponentProps<"select"> & { label?: string; error?: string }

export function Select({ className, label, error, id, children, ...props }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={cn(
          "min-h-11 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  )
}
