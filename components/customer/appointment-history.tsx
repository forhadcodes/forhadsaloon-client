"use client"

import Image from "next/image"
import { useEffect, useState, type ReactNode } from "react"
import { CreditCard, Eye } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Modal } from "@/components/ui/modal"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { ApiRequestError, appointmentsApi, paymentsApi } from "@/lib/api"
import type { Appointment } from "@/lib/types"
import { formatDate, formatPrice } from "@/lib/utils"

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-base-200 py-2 last:border-0">
      <span className="shrink-0 text-base-content/60">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  )
}

function getService(appointment: Appointment) {
  return typeof appointment.serviceId === "string" ? null : appointment.serviceId
}

export function AppointmentHistory() {
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Appointment[]>([])
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [viewing, setViewing] = useState<Appointment | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await appointmentsApi.my(
          { status: status || undefined, page },
          controller.signal,
        )
        if (cancelled) return
        setItems(data.items)
        setPages(data.pages)
        setTotal(data.total)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof ApiRequestError ? err.message : "Could not load your appointments.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [status, page, reloadKey])

  /** The list DTO omits the paid transaction, so fetch the full record on open. */
  async function openDetails(appointment: Appointment) {
    setViewing(appointment)
    setDetailLoading(true)
    try {
      const fresh = await appointmentsApi.byId(appointment.id)
      setViewing((current) => (current?.id === appointment.id ? fresh : current))
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "Could not load the full appointment details.",
      )
    } finally {
      setDetailLoading(false)
    }
  }

  async function cancelAppointment() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await appointmentsApi.cancel(cancelTarget.id)
      toast.success("Appointment cancelled.")
      setCancelTarget(null)
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : "Could not cancel the appointment.",
      )
    } finally {
      setCancelling(false)
    }
  }

  async function payNow(appointment: Appointment) {
    setPayingId(appointment.id)
    try {
      const { url } = await paymentsApi.checkout(appointment.id)
      window.location.assign(url)
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "Could not start payment. Please try again.",
      )
      setPayingId(null)
    }
  }

  const columns: DataTableColumn<Appointment>[] = [
    {
      key: "service",
      header: "Service",
      render: (appointment) => {
        const service = getService(appointment)
        return (
          <div className="flex items-center gap-2">
            {service?.image ? (
              <Image
                src={service.image}
                alt={service.serviceName}
                width={48}
                height={48}
                className="size-12 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <p className="font-medium">{service?.serviceName ?? "Service"}</p>
              <p className="text-xs text-base-content/60">{service?.category ?? "—"}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "category",
      header: "Category",
      render: (appointment) => getService(appointment)?.category ?? "—",
    },
    {
      key: "appointmentDate",
      header: "Appointment Date",
      render: (appointment) => formatDate(appointment.appointmentDate),
    },
    { key: "timeSlot", header: "Time", render: (appointment) => appointment.timeSlot },
    {
      key: "servicePrice",
      header: "Service Price",
      render: (appointment) => formatPrice(appointment.servicePrice),
    },
    {
      key: "status",
      header: "Appointment Status",
      render: (appointment) => <StatusBadge status={appointment.status} />,
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (appointment) => <StatusBadge status={appointment.paymentStatus} />,
    },
    {
      key: "createdAt",
      header: "Request Date",
      render: (appointment) => formatDate(appointment.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (appointment) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label={`View details for ${getService(appointment)?.serviceName ?? "appointment"}`}
            onClick={() => void openDetails(appointment)}
          >
            <Eye aria-hidden />
            View Details
          </Button>
          {appointment.status === "pending" ? (
            <Button
              variant="danger"
              size="sm"
              aria-label={`Cancel appointment for ${getService(appointment)?.serviceName ?? "this service"}`}
              onClick={() => setCancelTarget(appointment)}
            >
              Cancel
            </Button>
          ) : null}
          {appointment.status === "confirmed" && appointment.paymentStatus === "unpaid" ? (
            <Button
              variant="brand"
              size="sm"
              loading={payingId === appointment.id}
              disabled={payingId !== null}
              onClick={() => void payNow(appointment)}
            >
              <CreditCard aria-hidden />
              {payingId === appointment.id ? "Redirecting to payment..." : "Pay Now"}
            </Button>
          ) : null}
          {appointment.paymentStatus === "paid" ? (
            <span className="badge badge-success">Paid</span>
          ) : null}
        </div>
      ),
    },
  ]

  const viewedService = viewing ? getService(viewing) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">My Appointments</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Track your requests, view details and pay for confirmed appointments.
        </p>
      </div>

      <div className="sm:w-64">
        <Select
          aria-label="Filter appointments by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No appointments found"
          message={
            status
              ? "No appointments with this status. Try another filter."
              : "Book a service to see your appointment requests here."
          }
        />
      ) : (
        <>
          <p className="text-sm text-base-content/60" aria-live="polite">
            {total} appointment{total === 1 ? "" : "s"}
          </p>
          <DataTable columns={columns} data={items} rowKey={(appointment) => appointment.id} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      <Modal open={viewing !== null} onClose={() => setViewing(null)} title="Appointment Details">
        {detailLoading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-base-content/60">
            <Spinner />
            Loading details...
          </div>
        ) : viewing ? (
          <div>
            <Detail label="Service" value={viewedService?.serviceName ?? "Service"} />
            <Detail label="Category" value={viewedService?.category ?? "—"} />
            <Detail label="Appointment Date" value={formatDate(viewing.appointmentDate)} />
            <Detail label="Time" value={viewing.timeSlot} />
            <Detail label="Service Price" value={formatPrice(viewing.servicePrice)} />
            <Detail label="Message" value={viewing.message || "—"} />
            <Detail label="Appointment Status" value={<StatusBadge status={viewing.status} />} />
            <Detail
              label="Payment Status"
              value={<StatusBadge status={viewing.paymentStatus} />}
            />
            {viewing.paymentStatus === "paid" && viewing.transaction ? (
              <>
                <Detail
                  label="Amount Paid"
                  value={formatPrice(viewing.transaction.amount)}
                />
                <Detail label="Currency" value={viewing.transaction.currency.toUpperCase()} />
                <Detail label="Paid On" value={formatDate(viewing.transaction.createdAt)} />
              </>
            ) : null}
            <Detail label="Request Date" value={formatDate(viewing.createdAt)} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void cancelAppointment()}
        title="Cancel appointment"
        message="Cancel this pending appointment? This cannot be undone."
        confirmLabel="Cancel appointment"
        loading={cancelling}
      />
    </div>
  )
}
