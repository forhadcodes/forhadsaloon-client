"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Pencil, Search, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { LinkButton } from "@/components/ui/link-button"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ApiRequestError, adminServicesApi, api } from "@/lib/api"
import { CATEGORIES } from "@/lib/constants"
import type { Paginated, Service } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

const PAGE_SIZE = 10

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

export function ServicesTable() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 400)

  const [services, setServices] = useState<Service[]>([])
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim())
      if (category) params.set("category", category)

      try {
        const data = await api.get<Paginated<Service>>(
          `/api/admin/services?${params.toString()}`,
        )
        if (cancelled) return
        setServices(data.items)
        setPages(data.pages)
        setTotal(data.total)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : "Could not load services.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, category, page, reloadKey])

  async function toggleStatus(service: Service) {
    const nextStatus = service.status === "active" ? "inactive" : "active"

    setPendingId(service.id)
    setServices((current) =>
      current.map((item) => (item.id === service.id ? { ...item, status: nextStatus } : item)),
    )

    try {
      await api.patch<Service>(`/api/admin/services/${service.id}/status`, {
        status: nextStatus,
      })
      toast.success(nextStatus === "active" ? "Service activated." : "Service deactivated.")
    } catch (err) {
      setServices((current) =>
        current.map((item) => (item.id === service.id ? service : item)),
      )
      toast.error(err instanceof ApiRequestError ? err.message : "Could not update the service.")
    } finally {
      setPendingId(null)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget

    setPendingId(target.id)
    try {
      await adminServicesApi.delete(target.id)
      toast.success("Service deleted.")
      setDeleteTarget(null)
      setReloadKey((key) => key + 1)
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Could not delete the service.")
      setDeleteTarget(null)
    } finally {
      setPendingId(null)
    }
  }

  const columns: DataTableColumn<Service>[] = [
    {
      key: "image",
      header: "Image",
      render: (service) => (
        <Image
          src={service.image}
          alt={service.serviceName}
          width={64}
          height={48}
          className="h-12 w-16 rounded-lg object-cover"
        />
      ),
    },
    {
      key: "name",
      header: "Service",
      render: (service) => (
        <div className="min-w-40">
          <p className="font-medium">{service.serviceName}</p>
          <p className="line-clamp-1 text-xs text-base-content/60">{service.description}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (service) => service.category },
    { key: "price", header: "Price", render: (service) => formatPrice(service.price) },
    { key: "duration", header: "Duration", render: (service) => `${service.duration} min` },
    {
      key: "status",
      header: "Status",
      render: (service) => <StatusBadge status={service.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (service) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={pendingId === service.id}
            disabled={pendingId === service.id}
            onClick={() => void toggleStatus(service)}
          >
            {service.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <LinkButton
            href={`/dashboard/admin/services/${service.id}/edit`}
            variant="ghost"
            size="sm"
          >
            <Pencil aria-hidden />
            Edit
          </LinkButton>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            aria-label={`Delete ${service.serviceName}`}
            onClick={() => setDeleteTarget(service)}
          >
            <Trash2 aria-hidden />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const hasFilters = Boolean(debouncedSearch.trim() || category)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-base-content/40"
            aria-hidden
          />
          <Input
            aria-label="Search services by name"
            placeholder="Search by service name"
            className="pl-9"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>

        <div className="sm:w-64">
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          message={
            hasFilters
              ? "Try a different search term or category."
              : "Add your first service to start taking bookings."
          }
        />
      ) : (
        <>
          <p className="text-sm text-base-content/60" aria-live="polite">
            {total} service{total === 1 ? "" : "s"}
          </p>
          <DataTable columns={columns} data={services} rowKey={(service) => service.id} />
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete service?"
        message="This cannot be undone."
        confirmLabel="Delete"
        loading={pendingId === deleteTarget?.id}
      />
    </div>
  )
}
