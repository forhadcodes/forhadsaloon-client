import { redirect } from "next/navigation"

import { LinkButton } from "@/components/ui/link-button"
import { ROUTES } from "@/lib/constants"
import { getSession } from "@/lib/session"

const APPOINTMENTS_HREF = "/dashboard/customer/appointments"

export default async function PaymentCancelPage() {
  const user = await getSession()
  if (!user) redirect(`${ROUTES.signIn}?redirect=${encodeURIComponent("/payment/cancel")}`)
  if (user.isBlocked) redirect(`${ROUTES.signIn}?error=blocked`)
  if (user.role === "admin") redirect("/dashboard/admin")

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="card-salon mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="font-heading text-3xl">Payment cancelled</h1>
        <p className="mt-3 text-base-content/60">
          No charge was made. Your appointment remains confirmed and unpaid, so you can
          try again whenever you are ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href={APPOINTMENTS_HREF} variant="primary">
            Back to My Appointments
          </LinkButton>
          <LinkButton href={APPOINTMENTS_HREF} variant="outline">
            Try again
          </LinkButton>
        </div>
      </div>
    </main>
  )
}
