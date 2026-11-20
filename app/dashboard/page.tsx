import { redirect } from "next/navigation"

import { DASHBOARD_HOME, ROUTES } from "@/lib/constants"
import { getSession } from "@/lib/session"

export default async function DashboardIndexPage() {
  const user = await getSession()
  if (!user) redirect(ROUTES.signIn)
  if (user.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)
  redirect(DASHBOARD_HOME[user.role])
}

