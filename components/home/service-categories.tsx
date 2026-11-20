"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Brush,
  Droplets,
  Flower2,
  Hand,
  Palette,
  ScanFace,
  Scissors,
} from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { LinkButton } from "@/components/ui/link-button"
import { SectionHeading } from "@/components/ui/section-heading"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORIES, ROUTES } from "@/lib/constants"

const ICON_MAP: Record<string, typeof Scissors> = {
  "Haircut & Styling": Scissors,
  "Hair Coloring": Palette,
  "Hair Treatment": Droplets,
  "Facial & Skincare": ScanFace,
  Makeup: Brush,
  "Manicure & Pedicure": Hand,
  "Spa & Massage": Flower2,
}

export function ServiceCategories() {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/services/categories`,
          { method: "GET", credentials: "omit" },
        )
        const payload = (await res.json()) as {
          success: boolean
          data?: { items: { name: string; count: number }[]; total: number }
          message?: string
        }
        if (!res.ok || !payload?.data) throw new Error(payload?.message ?? "Failed")

        setCategories(
          CATEGORIES.map((name) => ({
            name,
            count: payload.data?.items.find((item) => item.name === name)?.count ?? 0,
          })),
        )
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load categories.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
  }

  if (categories.every((category) => category.count === 0)) {
    return (
      <EmptyState
        title="No services found"
        message="Try a different category or browse all services."
      />
    )
  }

  return (
    <section className="py-12 md:py-14">
      <SectionHeading
        title="Salon Service Categories"
        subtitle="Choose a category to filter services"
        action={
          <LinkButton href={ROUTES.services} variant="link" size="sm">
            Browse all
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = ICON_MAP[category.name]
          return (
            <Link
              key={category.name}
              href={`${ROUTES.services}?category=${encodeURIComponent(category.name)}`}
              aria-label={`Browse ${category.name} services (${category.count} available)`}
              className="card-salon block p-4 outline-none transition-shadow duration-150 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="line-clamp-1 text-sm font-medium">{category.name}</h3>
              <p className="text-xs text-base-content/60">
                {category.count} service{category.count === 1 ? "" : "s"}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
