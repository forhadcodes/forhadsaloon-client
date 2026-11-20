import { requireRole } from "@/lib/session"

export default async function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("customer")
  return <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
}
