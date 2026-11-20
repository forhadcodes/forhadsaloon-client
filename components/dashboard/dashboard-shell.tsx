"use client"

import { useState } from "react"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardTopBar } from "@/components/dashboard/top-bar"
import { DASHBOARD_NAV } from "@/lib/dashboard-nav"
import type { CurrentUser } from "@/lib/types"

type DashboardShellProps = {
  user: CurrentUser
  children: React.ReactNode
}

/**
 * Fixed sidebar from lg up, slide-over drawer below lg.
 * Nav items live in the client bundle so the icon components never cross
 * the server/client boundary. The checkbox is controlled so navigating
 * closes the drawer.
 */
export function DashboardShell({ user, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false)
  const nav = DASHBOARD_NAV[user.role]

  return (
    <div className="drawer min-h-screen bg-base-200 lg:drawer-open">
      <input
        id="dashboard-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(event) => setOpen(event.target.checked)}
      />

      <div className="drawer-content flex min-h-screen flex-col">
        <DashboardTopBar user={user} onOpenMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="dashboard-drawer"
          aria-label="Close dashboard menu"
          className="drawer-overlay"
        />
        <SidebarNav user={user} nav={nav} onNavigate={() => setOpen(false)} />
      </div>
    </div>
  )
}
