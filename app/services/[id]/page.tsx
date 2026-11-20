import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ServiceDetailsLoader } from "@/components/service-details/service-details-loader"
import { ROUTES } from "@/lib/constants"
import { getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Service Details",
  description: "View service details and request an appointment at SalonBook.",
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fresh, authoritative guard: this page is reachable from public Browse.
  const session = await getSession()
  if (!session) redirect(`${ROUTES.signIn}?redirect=/services/${id}`)
  if (session.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ServiceDetailsLoader id={id} isAdmin={session.role === "admin"} />
    </div>
  )
}
