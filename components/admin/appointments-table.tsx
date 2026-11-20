"use client"

import Image from "next/image"
import { useEffect, useState, type ReactNode } from "react"
import { Eye } from "lucide-react"
import toast from "react-hot-toast"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Modal } from "@/components/ui/modal"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import { ApiRequestError, appointmentsApi } from "@/lib/api"
import type { Appointment } from "@/lib/types"
import { formatDate, formatPrice } from "@/lib/utils"

type Action = "confirm" | "cancel"

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

function Initials({ name }: { name?: string }) {
  const initials = (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return <span className="text-xs font-semibold">{initials || "?"}</span>
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-base-200 py-2 last:border-0">
      <span className="shrink-0 text-base-content/60">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  )
}

function getCustomer(appointment: Appointment) {
  return typeof appointment.customerId === "string" ? null : appointment.customerId
}

function getService(appointment: Appointment) {
  return typeof appointment.serviceId === "string" ? null : appointment.serviceId
}

function customerName(appointment: Appointment | null): string {
  if (!appointment) return "this customer"
  return getCustomer(appointment)?.name ?? "this customer"
}

export function AppointmentsTable() {
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
  const [confirmTarget, setConfirmTarget] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [action, setAction] = useState<Action | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await appointmentsApi.adminList(
          { status: status || undefined, page },
          controller.signal,
        )
        if (cancelled) return
        setItems(data.items)
        setPages(data.pages)
        setTotal(data.total)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(
          err instanceof ApiRequestError ? err.message : "Could not load appointments.",
        )
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

  async function openDetails(appointment: Appointment) {
    setViewing(appointment)
    setDetailLoading(true)
    try {
      const fresh = await appointmentsApi.adminById(appointment.id)
      setViewing((current) => (current?.id === appointment.id ? fresh : current))
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : "Could not load the full appointment details.",
      )
    } finally {
      setDetailLoading(false)
    }
  }

  async function runAction(target: Appointment, type: Action) {
    setAction(type)
    try {
      if (type === "confirm") {
        await appointmentsApi.adminConfirm(target.id)
        toast.success("Appointment confirmed.")
        setConfirmTarget(null)
      } else {
        await appointmentsApi.adminCancel(target.id)
        toast.success("Appointment cancelled.")
        setCancelTarget(null)
      }
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : `Could not ${type === "confirm" ? "confirm" : "cancel"} the appointment.`,
      )
    } finally {
      setAction(null)
    }
  }

  const columns: DataTableColumn<Appointment>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (appointment) => {
        const customer = getCustomer(appointment)
        return (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              {customer?.image ? <AvatarImage src={customer.image} alt="" /> : null}
              <AvatarFallback className="text-xs">
                <Initials name={customer?.name} />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">{customer?.name ?? "Unknown customer"}</p>
              <p className="truncate text-xs text-base-content/60">
                {customer?.email ?? "—"}
              </p>
              {customer?.phone ? (
                <p className="text-xs text-base-content/60">{customer.phone}</p>
              ) : null}
            </div>
          </div>
        )
      },
    },
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
              <p className="font-medium">{service?.serviceName ?? "Unknown service"}</p>
              <p className="text-xs text-base-content/60">{service?.category ?? "—"}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "appointmentDate",
      header: "Appointment Date",
      render: (appointment) => formatDate(appointment.appointmentDate),
    },
    { key: "timeSlot", header: "Time", render: (appointment) => appointment.timeSlot },
    {
      key: "message",
      header: "Message",
      render: (appointment) =>
        appointment.message ? (
          <span className="line-clamp-2 max-w-52 text-sm">{appointment.message}</span>
        ) : (
          <span className="text-base-content/40">—</span>
        ),
    },
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
      header: "Requested",
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
            onClick={() => void openDetails(appointment)}
            aria-label={`View details for ${getCustomer(appointment)?.name ?? "appointment"}`}
          >
            <Eye aria-hidden />
            View
          </Button>
          {appointment.status === "pending" ? (
            <Button variant="brand" size="sm" onClick={() => setConfirmTarget(appointment)}>
              Confirm
            </Button>
          ) : null}
          {appointment.status === "pending" || appointment.status === "confirmed" ? (
            <Button variant="danger" size="sm" onClick={() => setCancelTarget(appointment)}>
              Cancel
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  const viewedCustomer = viewing ? getCustomer(viewing) : null
  const viewedService = viewing ? getService(viewing) : null

  return (
    <div className="space-y-4">
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
              : "Appointment requests will appear here when customers book."
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

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title="Appointment Details"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-base-content/60">
            <Spinner />
            Loading details...
          </div>
        ) : viewing ? (
          <div>
            <Detail label="Customer" value={viewedCustomer?.name ?? "Unknown customer"} />
            <Detail label="Email" value={viewedCustomer?.email ?? "—"} />
            <Detail label="Phone" value={viewedCustomer?.phone ?? "—"} />
            <Detail label="Service" value={viewedService?.serviceName ?? "Unknown service"} />
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
            {viewing.transaction ? (
              <>
                <Detail
                  label="Amount Paid"
                  value={formatPrice(viewing.transaction.amount)}
                />
                <Detail label="Currency" value={viewing.transaction.currency.toUpperCase()} />
                <Detail label="Paid On" value={formatDate(viewing.transaction.createdAt)} />
              </>
            ) : null}
            <Detail label="Requested" value={formatDate(viewing.createdAt)} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => void (confirmTarget ? runAction(confirmTarget, "confirm") : undefined)}
        title="Confirm appointment"
        message={`Confirm the appointment for ${customerName(confirmTarget)}? They will be notified and can then pay.`}
        confirmLabel="Confirm"
        destructive={false}
        loading={action === "confirm"}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void (cancelTarget ? runAction(cancelTarget, "cancel") : undefined)}
        title="Cancel appointment"
        message={`Cancel the appointment for ${customerName(cancelTarget)}? This cannot be undone.`}
        confirmLabel="Cancel appointment"
        loading={action === "cancel"}
      />
    </div>
  )
}
