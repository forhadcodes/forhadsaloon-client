"use client"

import type { Metadata } from "next"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CATEGORIES, ROUTES } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"
import { api } from "@/lib/api"
import { StatusBadge } from "@/components/ui/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { ServiceCard } from "@/components/ServiceCard"

type Service = {
  id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: "active" | "inactive"
}

type QueryState = {
  search: string
  category: string | null
  sort: "newest" | "price_asc" | "price_desc"
  page: number
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export default function ServicesPage() {
  const urlSearchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState<QueryState>(() => {
    const sp = urlSearchParams
    return {
      search: sp.get("search") || "",
      category:
        sp.get("category") && sp.get("category") !== "All"
          ? sp.get("category")
          : sp.get("category") === "All"
          ? null
          : null,
      sort: (sp.get("sort") as "newest" | "price_asc" | "price_desc") || "newest",
      page: parseInt(sp.get("page") || String(DEFAULT_PAGE), 10),
    }
  })

  useEffect(() => {
    const params = new URLSearchParams()
    if (query.search) params.set("search", query.search)
    else params.delete("search")
    if (query.category) params.set("category", query.category)
    else params.delete("category")
    params.set("sort", query.sort)
    params.set("page", String(query.page))
    router.replace(`/${ROUTES.services}?${params.toString()}`)
  }, [query.search, query.category, query.sort, query.page, router])

  const debouncedSearch = useDebouncedValue(query.search, 400)

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<{
        items: Service[]
        total: number
        page: number
        pages: number
      }>(
        `/api/services?search=${encodeURIComponent(
          debouncedSearch,
        )}&category=${query.category || ""}&sort=${query.sort}&page=${query.page}`,
      )

      setServices(response.items)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message ?? "Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    return () => {
      // cleanup
    }
  }, [debouncedSearch, query.category, query.sort, query.page])

  const pages = Math.max(Math.ceil(total / DEFAULT_LIMIT), 1)

  const toolbar = (
    <div className="bg-base-200 rounded-xl p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
        <div>
          <Input
            placeholder="Search services..."
            value={query.search}
            onChange={(e: any) => {
              setQuery({ ...query, search: e.target.value })
            }}
          />
        </div>
        <div>
          <Select
            value={query.category ?? "All"}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const val = (e.target as HTMLSelectElement).value
              setQuery({ ...query, category: val === "" ? null : val })
            }}
          >
            <option value="">All</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            value={query.sort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const val = (e.target as HTMLSelectElement).value
              setQuery({ ...query, sort: val as "newest" | "price_asc" | "price_desc" })
            }}
          >
            <option value="newest">Default (Newest)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>
        </div>
      </div>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setQuery({
              search: "",
              category: null,
              sort: "newest",
              page: DEFAULT_PAGE,
            })
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton className="h-48 rounded-2xl" key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          load()
        }}
      />
    )
  }

  if (total === 0) {
    return (
      <EmptyState
        title="No services found"
        message="There are no services matching your criteria. Try adjusting your search or filters."
      />
    )
  }

  const cardGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.id}`}
          className="group"
        >
          <ServiceCard service={service} />
        </Link>
      ))}
    </div>
  )

  const paginationSection = (
    <div className="text-sm text-base-content/60 mt-4">
      {pages > 1 && (
        <Pagination
          page={query.page}
          pages={pages}
          onChange={(newPage: number) => {
            setQuery({ ...query, page: newPage })
          }}
        />
      )}
      Showing{Math.min((query.page - 1) * DEFAULT_LIMIT + services.length, total)} of
      {total} services
    </div>
  )

  return (
    <div className="space-y-6">
      {toolbar}
      {cardGrid}
      {paginationSection}
    </div>
  )
}

export const metadata: Metadata = {
  title: "Browse Salon Services",
  description: "Browse salon services and request appointments online.",
}