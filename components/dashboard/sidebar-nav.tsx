"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import type { DashboardNavItem } from "@/lib/dashboard-nav"
import type { CurrentUser } from "@/lib/types"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  user: CurrentUser
  nav: DashboardNavItem[]
  onNavigate: () => void
}

/**
 * The active link is the longest matching href, so "Manage Services"
 * stays inactive while "/services/new" highlights "Add Service".
 */
function resolveActiveHref(pathname: string, nav: DashboardNavItem[]): string | undefined {
  return nav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
}

export function SidebarNav({ user, nav, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const activeHref = resolveActiveHref(pathname, nav)

  return (
    <aside className="flex min-h-full w-64 flex-col border-r border-base-300 bg-base-100">
      <div className="flex h-16 shrink-0 items-center border-b border-base-300 px-4">
        <Logo className="h-9" />
      </div>

      <p className="px-5 pt-5 pb-2 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
        {user.role === "admin" ? "Admin panel" : "Customer panel"}
      </p>

      <nav aria-label="Dashboard" className="flex-1 space-y-1 px-3 pb-6">
        {nav.map((item) => {
          const active = item.href === activeHref
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-primary text-primary-content"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-base-300 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-base-content/60 transition-colors duration-150 hover:bg-base-200 hover:text-base-content"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to site
        </Link>
      </div>
    </aside>
  )
}
