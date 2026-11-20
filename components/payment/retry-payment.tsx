"use client"

import { useState } from "react"
import { CreditCard } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { ApiRequestError, paymentsApi } from "@/lib/api"

/** Re-opens a fresh Stripe Checkout session for the same appointment. */
export function RetryPayment({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false)

  async function retry() {
    setLoading(true)
    try {
      const { url } = await paymentsApi.checkout(appointmentId)
      window.location.assign(url)
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "Could not restart payment. Please try again from My Appointments.",
      )
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="primary"
      loading={loading}
      disabled={loading}
      onClick={() => void retry()}
    >
      <CreditCard aria-hidden />
      {loading ? "Redirecting to payment..." : "Try again"}
    </Button>
  )
}
