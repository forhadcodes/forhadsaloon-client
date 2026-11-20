"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { ServiceCard } from "@/components/ServiceCard"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { CATEGORIES, ROUTES } from "@/lib/constants"
import type { Paginated, Service } from "@/lib/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

type Sort = "newest" | "price_asc" | "price_desc"

type Query = {
  search: string
  category: string
  sort: Sort
  page: number
}

const LIMIT = 12

function readQuery(params: URLSearchParams): Query {
  const sort = params.get("sort")
  const page = Number(params.get("page"))
  return {
    search: params.get("search") ?? "",
    category: params.get("category") ?? "",
    sort: sort === "price_asc" || sort === "price_desc" ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function BrowseServices() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState<Query>(() => readQuery(new URLSearchParams(searchParams.toString())))
  const [result, setResult] = useState<Paginated<Service> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(query.search, 400)

  // Keep the URL shareable: every filter lives in the query string.
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.search) params.set("search", query.search)
    if (query.category) params.set("category", query.category)
    if (query.sort !== "newest") params.set("sort", query.sort)
    if (query.page > 1) params.set("page", String(query.page))
    const target = `/${ROUTES.services}${params.size ? `?${params}` : ""}`
    if (`${searchParams}` !== params.toString()) router.replace(target, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, router])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        search: debouncedSearch,
        category: query.category,
        sort: query.sort,
        page: String(query.page),
        limit: String(LIMIT),
      })
      try {
        const data = await api.get<Paginated<Service>>(
          `/api/services?${params}`,
          controller.signal,
        )
        if (active) setResult(data)
      } catch (err: unknown) {
        if (active && !controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Could not load services.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [debouncedSearch, query.category, query.sort, query.page])

  const update = (patch: Partial<Query>) => setQuery((prev) => ({ ...prev, ...patch, page: 1 }))

  const reset = () => {
    setQuery({ search: "", category: "", sort: "newest", page: 1 })
  }

  const resultCount = result?.total ?? 0
  const showingFrom = resultCount === 0 ? 0 : (query.page - 1) * LIMIT + 1
  const showingTo = Math.min(query.page * LIMIT, resultCount)

  return (
    <div className="space-y-6">
      <div className="bg-base-200 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="browse-search" className="mb-1 block text-sm font-medium">
              Search services
            </label>
            <Input
              id="browse-search"
              placeholder="e.g. Haircut"
              value={query.search}
              onChange={(event) => update({ search: event.target.value })}
            />
          </div>
          <div>
            <Select
              label="Category"
              value={query.category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              label="Sort by"
              value={query.sort}
              onChange={(event) => update({ sort: event.target.value as Sort })}
            >
              <option value="newest">Default (Newest)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" className="w-full" onClick={reset}>
              Reset filters
            </Button>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <p className="text-sm text-base-content/60" aria-live="polite">
          {resultCount === 0
            ? "No services found"
            : `Showing ${showingFrom}–${showingTo} of ${resultCount} services`}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setQuery((prev) => ({ ...prev }))} />
      ) : !result || result.items.length === 0 ? (
        <EmptyState
          title="No services found"
          message="Try a different search or clear the filters to see all services."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {result && result.pages > 1 && (
        <Pagination
          page={query.page}
          pages={result.pages}
          onChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        />
      )}
    </div>
  )
}
