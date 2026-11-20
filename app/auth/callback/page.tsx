import { redirect } from "next/navigation"

import { DASHBOARD_HOME, ROUTES } from "@/lib/constants"
import { getSession } from "@/lib/session"

function safeRedirect(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null
}

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const user = await getSession()
  if (!user) redirect(ROUTES.signIn)
  if (user.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)

  const { redirect: requested } = await searchParams
  if (user.role === "admin") redirect(DASHBOARD_HOME.admin)
  redirect(safeRedirect(requested) ?? DASHBOARD_HOME.customer)
}
