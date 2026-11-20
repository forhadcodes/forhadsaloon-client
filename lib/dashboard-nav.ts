import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Scissors,
  CirclePlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@/lib/types"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const ADMIN_DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Manage Services", href: "/dashboard/admin/services", icon: Scissors },
  { label: "Add Service", href: "/dashboard/admin/services/new", icon: CirclePlus },
  { label: "Manage Appointments", href: "/dashboard/admin/appointments", icon: CalendarDays },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
  { label: "My Profile", href: "/dashboard/admin/profile", icon: UserRound },
]

export const CUSTOMER_DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  { label: "My Appointments", href: "/dashboard/customer/appointments", icon: CalendarDays },
  { label: "My Profile", href: "/dashboard/customer/profile", icon: UserRound },
]

/** One config, two sidebars — the role decides which list is rendered. */
export const DASHBOARD_NAV: Record<UserRole, DashboardNavItem[]> = {
  admin: ADMIN_DASHBOARD_NAV,
  customer: CUSTOMER_DASHBOARD_NAV,
}
