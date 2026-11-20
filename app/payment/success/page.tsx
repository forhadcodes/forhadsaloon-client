import { redirect } from "next/navigation"

import { PaymentStatus } from "@/components/payment/payment-status"
import { ErrorState } from "@/components/ui/error-state"
import { LinkButton } from "@/components/ui/link-button"
import { ROUTES } from "@/lib/constants"
import { getSession } from "@/lib/session"

const APPOINTMENTS_HREF = "/dashboard/customer/appointments"

type Props = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams

  const returnPath = sessionId
    ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
    : "/payment/success"

  const user = await getSession()
  if (!user) redirect(`${ROUTES.signIn}?redirect=${encodeURIComponent(returnPath)}`)
  if (user.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)
  if (user.role === "admin") redirect("/dashboard/admin")

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      {sessionId ? (
        <PaymentStatus sessionId={sessionId} />
      ) : (
        <div className="mx-auto max-w-xl space-y-6">
          <ErrorState message="We are missing your payment session reference. Please check My Appointments for the latest status." />
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href={APPOINTMENTS_HREF} variant="primary">
              My Appointments
            </LinkButton>
            <LinkButton href={ROUTES.home} variant="outline">
              Back Home
            </LinkButton>
          </div>
        </div>
      )}
    </main>
  )
}
