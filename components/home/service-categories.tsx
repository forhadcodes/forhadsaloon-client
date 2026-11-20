"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeading } from "@/components/ui/section-heading"
import { LinkButton } from "@/components/ui/link-button"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Scissors,
  Palette,
  Droplets,
  ScanFace,
  Brush,
  Hand,
  Flower2,
} from "lucide-react"
import { CATEGORIES, ROUTES } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"

const ICON_MAP: Record<string, typeof Scissors> = {
  "Haircut & Styling": Scissors,
  "Hair Coloring": Palette,
  "Hair Treatment": Droplets,
  "Facial & Skincare": ScanFace,
  "Makeup": Brush,
  "Manicure & Pedicure": Hand,
  "Spa & Massage": Flower2,
}

export function ServiceCategories() {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/services/categories`,
          {
            method: "GET",
            headers: {},
            credentials: "omit",
          },
        )
        const payload = (await res.json()) as {
          success: boolean
          data?: { items: { name: string; count: number }[]; total: number }
          message?: string
        }
        if (!res.ok || !payload?.data) throw new Error(payload?.message ?? "Failed")
        const dataFromPayload = payload.data
        if (!cancelled && dataFromPayload) {
          const mapped: { name: string; count: number }[] = CATEGORIES.map((cat) => {
            const found = dataFromPayload.items.find((i) => i.name === cat)
            return { name: cat, count: found ? found.count : 0 }
          })
          setCategories(mapped)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load categories.")
          setLoading(false)
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [categoryFromUrl])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="rounded-2xl h-48 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setCategories([])} />
  }

  // empty state: if the URL filtered to a category that has 0 services
  if (categories.length > 0 && categories.every((c) => c.count === 0)) {
    return (
      <EmptyState
        title="No services found"
        message="Try a different category or browse all services."
      />
    )
  }

  return (
    <section className="py-12">
      <SectionHeading
        title="Salon Categories"
        subtitle="Choose a category to filter services"
        action={
          <LinkButton
            href={ROUTES.services}
            variant="link"
            size="sm"
          >
            Browse all
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.name]
          return (
            <article
              key={cat.name}
              className="group rounded-2xl border border-base-300 bg-base-100 p-4 hover:bg-base-200 transition-colors duration-150 cursor-pointer"
              onClick={() => router.push(`${ROUTES.services}?category=${encodeURIComponent(cat.name)}`)}
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${cat.name} (${cat.count} services)`}
            >
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3">
                <Icon className="size-6" />
              </div>

              <h3 className="text-sm font-medium text-base-content line-clamp-1">{cat.name}</h3>
              <p className="text-xs text-base-content/60">{cat.count} service{cat.count === 1 ? "" : "s"}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}