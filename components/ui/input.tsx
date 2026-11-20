import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-base transition-colors duration-150 outline-none placeholder:text-base-content/40 focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/30 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
