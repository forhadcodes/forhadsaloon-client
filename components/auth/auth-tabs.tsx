"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const AUTH_TABS = [
  { label: "Sign In", href: ROUTES.signIn },
  { label: "Sign Up", href: ROUTES.signUp },
]

/** Segmented toggle that switches between the sign-in and sign-up pages. */
export function AuthTabs() {
  const pathname = usePathname()

  return (
    <div
      role="tablist"
      aria-label="Authentication"
      className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
    >
      {AUTH_TABS.map((tab) => {
        const isActive = pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
