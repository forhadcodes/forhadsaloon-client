import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ROUTES } from "@/lib/constants"
import { getSession } from "@/lib/session"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()

  if (!user) redirect(`${ROUTES.signIn}?redirect=${encodeURIComponent(ROUTES.dashboard)}`)
  if (user.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  )
}
