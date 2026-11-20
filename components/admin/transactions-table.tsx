"use client"

import { useEffect, useState } from "react"
import { Copy } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { ApiRequestError, paymentsApi } from "@/lib/api"
import type { Transaction } from "@/lib/types"
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

function shortenSessionId(id: string): string {
  if (id.length <= 20) return id
  return `${id.slice(0, 8)}…${id.slice(-6)}`
}

function getAppointment(transaction: Transaction) {
  return typeof transaction.appointmentId === "string" ? null : transaction.appointmentId
}

function getCustomer(transaction: Transaction) {
  return typeof transaction.customerId === "string" ? null : transaction.customerId
}

export function TransactionsTable() {
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Transaction[]>([])
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await paymentsApi.adminTransactions(
          { status: status || undefined, page },
          controller.signal,
        )
        if (cancelled) return
        setItems(data.items)
        setPages(data.pages)
        setTotal(data.total)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof ApiRequestError ? err.message : "Could not load transactions.")
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

  async function copySessionId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      toast.success("Session ID copied to clipboard.")
    } catch {
      toast.error("Could not copy the session ID. Please copy it manually.")
    }
  }

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (transaction) => {
        const customer = getCustomer(transaction)
        return (
          <div className="min-w-40">
            <p className="font-medium">{customer?.name ?? "Unknown customer"}</p>
            <p className="truncate text-xs text-base-content/60">
              {customer?.email ?? "—"}
            </p>
          </div>
        )
      },
    },
    {
      key: "service",
      header: "Related Service",
      render: (transaction) => getAppointment(transaction)?.serviceName || "—",
    },
    {
      key: "appointmentDate",
      header: "Appointment",
      render: (transaction) => {
        const appointment = getAppointment(transaction)
        return (
          <div>
            <p>{appointment ? formatDate(appointment.appointmentDate) : "—"}</p>
            {appointment?.timeSlot ? (
              <p className="text-xs text-base-content/60">{appointment.timeSlot}</p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: "amount",
      header: "Payment Amount",
      render: (transaction) => formatPrice(transaction.amount),
    },
    {
      key: "currency",
      header: "Currency",
      render: (transaction) => transaction.currency.toUpperCase(),
    },
    {
      key: "sessionId",
      header: "Checkout Session ID",
      render: (transaction) => (
        <div className="flex items-center gap-1">
          <code className="text-xs" title={transaction.stripeSessionId}>
            {shortenSessionId(transaction.stripeSessionId)}
          </code>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy Stripe Checkout Session ID"
            title="Copy session ID"
            onClick={() => void copySessionId(transaction.stripeSessionId)}
          >
            <Copy aria-hidden />
          </Button>
        </div>
      ),
    },
    {
      key: "status",
      header: "Payment Status",
      render: (transaction) => <StatusBadge status={transaction.status} />,
    },
    {
      key: "createdAt",
      header: "Transaction Date",
      render: (transaction) => formatDate(transaction.createdAt),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="sm:w-64">
        <Select
          aria-label="Filter transactions by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No transactions found"
          message={
            status
              ? "No transactions with this status. Try another filter."
              : "Payments will appear here once customers complete checkout."
          }
        />
      ) : (
        <>
          <p className="text-sm text-base-content/60" aria-live="polite">
            {total} transaction{total === 1 ? "" : "s"}
          </p>
          <DataTable columns={columns} data={items} rowKey={(transaction) => transaction.id} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
