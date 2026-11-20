"use client"

import { CheckCircle2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { ErrorState } from "@/components/ui/error-state"
import { LinkButton } from "@/components/ui/link-button"
import { Spinner } from "@/components/ui/spinner"
import { ApiRequestError, paymentsApi } from "@/lib/api"
import { formatDate, formatPrice } from "@/lib/utils"

const POLL_INTERVAL_MS = 2_000
const MAX_POLLS = 15 // 15 × 2s ≈ 30s

type PaymentSession = {
  confirmed: boolean
  amount: number
  currency: string
  appointment: {
    id: string
    serviceName: string
    appointmentDate: string
    timeSlot: string
    paymentStatus: string
  }
}

type Phase = "checking" | "confirmed" | "timeout" | "error"

const APPOINTMENTS_HREF = "/dashboard/customer/appointments"

export function PaymentStatus({ sessionId }: { sessionId: string }) {
  const [phase, setPhase] = useState<Phase>("checking")
  const [result, setResult] = useState<PaymentSession | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let polls = 0

    async function check(isPoll: boolean) {
      try {
        const data = await paymentsApi.session(sessionId)
        if (cancelled) return

        setResult(data)
        if (data.confirmed) {
          setPhase("confirmed")
          return
        }

        if (isPoll) polls += 1
        if (polls >= MAX_POLLS) {
          setPhase("timeout")
          return
        }
        timer = setTimeout(() => void check(true), POLL_INTERVAL_MS)
      } catch (error) {
        if (cancelled) return
        setErrorMessage(
          error instanceof ApiRequestError
            ? error.message
            : "We could not check your payment status. Please try again.",
        )
        setPhase("error")
      }
    }

    void check(false)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId, retryKey])

  const retry = useCallback(() => {
    setPhase("checking")
    setErrorMessage("")
    setRetryKey((key) => key + 1)
  }, [])

  if (phase === "error") {
    return <ErrorState message={errorMessage} onRetry={retry} />
  }

  if (phase === "checking") {
    return (
      <div className="card-salon flex flex-col items-center gap-4 px-6 py-16 text-center">
        <Spinner className="size-8 text-primary" />
        <h1 className="font-heading text-2xl">Confirming your payment...</h1>
        <p className="max-w-md text-sm text-base-content/60">
          This usually takes a few moments while we wait for the payment confirmation.
        </p>
      </div>
    )
  }

  if (phase === "timeout") {
    return (
      <div className="card-salon flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="font-heading text-2xl">One moment please</h1>
        <p className="max-w-md text-sm text-base-content/60">
          Your payment is being processed; it will appear in My Appointments shortly.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <LinkButton href={APPOINTMENTS_HREF} variant="primary">
            My Appointments
          </LinkButton>
          <LinkButton href="/" variant="outline">
            Back Home
          </LinkButton>
        </div>
      </div>
    )
  }

  const appointment = result?.appointment

  return (
    <div className="card-salon mx-auto max-w-xl px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="size-8 text-success" aria-hidden />
      </div>
      <h1 className="font-heading text-3xl">Payment received</h1>
      <p className="mt-2 text-base-content/60">
        Thank you. Your payment has been confirmed and your appointment is all set.
      </p>

      <dl className="mt-8 space-y-3 rounded-2xl bg-base-200 p-5 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-base-content/60">Service</dt>
          <dd className="font-medium text-right">{appointment?.serviceName ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-base-content/60">Date</dt>
          <dd className="font-medium text-right">
            {appointment ? formatDate(appointment.appointmentDate) : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-base-content/60">Time</dt>
          <dd className="font-medium text-right">{appointment?.timeSlot ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-base-300 pt-3">
          <dt className="text-base-content/60">Amount paid</dt>
          <dd className="text-right text-lg font-bold text-primary">
            {formatPrice(result?.amount ?? 0)}{" "}
            <span className="text-xs font-normal uppercase text-base-content/60">
              {result?.currency ?? ""}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href={APPOINTMENTS_HREF} variant="primary">
          My Appointments
        </LinkButton>
        <LinkButton href="/" variant="outline">
          Back Home
        </LinkButton>
      </div>
    </div>
  )
}
