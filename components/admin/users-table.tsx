"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Ban, CheckCircle2, Eye, Search } from "lucide-react"
import toast from "react-hot-toast"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ApiRequestError, profileApi } from "@/lib/api"
import type { AppointmentStats, UserSummary } from "@/lib/types"
import { formatDate } from "@/lib/utils"

type UserDetail = UserSummary & { appointmentCounts?: AppointmentStats }
type BlockAction = "block" | "unblock"

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

export function UsersTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 400)
  const [items, setItems] = useState<UserSummary[]>([])
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<UserSummary | null>(null)
  const [blockAction, setBlockAction] = useState<BlockAction | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await profileApi.adminUsers(
          { search: debouncedSearch.trim() || undefined, page },
          controller.signal,
        )
        if (cancelled) return
        setItems(data.items)
        setPages(data.pages)
        setTotal(data.total)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof ApiRequestError ? err.message : "Could not load customers.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedSearch, page, reloadKey])

  useEffect(() => {
    const id = detailId
    if (!id) return
    const userId: string = id
    let cancelled = false

    async function loadDetail() {
      setDetailLoading(true)
      setDetail(null)
      try {
        const data = await profileApi.adminUser(userId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof ApiRequestError ? err.message : "Could not load user details.",
          )
        }
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }

    void loadDetail()
    return () => {
      cancelled = true
    }
  }, [detailId])

  async function applyBlockAction(user: UserSummary) {
    const type: BlockAction = user.isBlocked ? "unblock" : "block"
    setBlockAction(type)

    try {
      if (type === "block") {
        await profileApi.block(user.id)
        toast.success(`${user.name} has been blocked.`)
      } else {
        await profileApi.unblock(user.id)
        toast.success(`${user.name} has been unblocked.`)
      }
      setConfirmTarget(null)
      setReloadKey((key) => key + 1)
      if (detailId === user.id) setDetailId(null)
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError ? err.message : `Could not ${type} this customer.`,
      )
    } finally {
      setBlockAction(null)
    }
  }

  const columns: DataTableColumn<UserSummary>[] = [
    {
      key: "name",
      header: "Customer",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="text-xs">
              <Initials name={user.name} />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <span className="text-sm">{user.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => <span className="text-sm">{user.phone || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <StatusBadge status={user.isBlocked ? "blocked" : "active"} />
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (user) => (user.createdAt ? formatDate(user.createdAt) : "—"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailId(user.id)}
            aria-label={`View details for ${user.name}`}
          >
            <Eye aria-hidden />
            View Details
          </Button>
          <Button
            variant={user.isBlocked ? "brand" : "danger"}
            size="sm"
            onClick={() => setConfirmTarget(user)}
          >
            {user.isBlocked ? (
              <CheckCircle2 aria-hidden />
            ) : (
              <Ban aria-hidden />
            )}
            {user.isBlocked ? "Unblock" : "Block"}
          </Button>
        </div>
      ),
    },
  ]

  const counts = detail?.appointmentCounts

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-base-content/40"
          aria-hidden
        />
        <Input
          aria-label="Search customers by name or email"
          placeholder="Search by name or email"
          className="pl-9"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No customers found"
          message={
            debouncedSearch.trim()
              ? "Try a different search term."
              : "Registered customers will appear here."
          }
        />
      ) : (
        <>
          <p className="text-sm text-base-content/60" aria-live="polite">
            {total} customer{total === 1 ? "" : "s"}
          </p>
          <DataTable columns={columns} data={items} rowKey={(user) => user.id} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title="Customer Details"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-base-content/60">
            <Spinner />
            Loading customer details...
          </div>
        ) : detail ? (
          <div>
            <Detail label="Name" value={detail.name} />
            <Detail label="Email" value={detail.email} />
            <Detail label="Phone" value={detail.phone || "—"} />
            <Detail
              label="Status"
              value={<StatusBadge status={detail.isBlocked ? "blocked" : "active"} />}
            />
            <Detail
              label="Joined"
              value={detail.createdAt ? formatDate(detail.createdAt) : "—"}
            />
            <Detail label="Total Appointments" value={counts?.total ?? 0} />
            <Detail label="Pending" value={counts?.pending ?? 0} />
            <Detail label="Confirmed" value={counts?.confirmed ?? 0} />
            <Detail label="Cancelled" value={counts?.cancelled ?? 0} />
          </div>
        ) : (
          <p className="py-8 text-center text-base-content/60">No details available.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => void (confirmTarget ? applyBlockAction(confirmTarget) : undefined)}
        title={confirmTarget?.isBlocked ? "Unblock customer" : "Block customer"}
        message={
          confirmTarget?.isBlocked
            ? `Unblock ${confirmTarget.name}? They will be able to sign in and book again.`
            : `Block ${confirmTarget?.name ?? "this customer"}? They will be signed out immediately and can no longer book appointments.`
        }
        confirmLabel={confirmTarget?.isBlocked ? "Unblock" : "Block"}
        destructive={!confirmTarget?.isBlocked}
        loading={blockAction !== null}
      />
    </div>
  )
}
