"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

type NavLinkProps = {
  href: string
  label: string
  /** "inline" is the desktop navbar style, "block" is used inside the mobile sheet. */
  variant?: "inline" | "block"
  /** Called after the link is clicked, e.g. to close the mobile menu. */
  onNavigate?: () => void
  className?: string
}

/** A link is active on its own route and on any nested route below it. */
export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLink({
  href,
  label,
  variant = "inline",
  onNavigate,
  className,
}: NavLinkProps) {
  const pathname = usePathname()
  const active = isNavLinkActive(pathname, href)

  if (variant === "block") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          className
        )}
      >
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative py-2 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-brand transition-transform duration-200",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  )
}
