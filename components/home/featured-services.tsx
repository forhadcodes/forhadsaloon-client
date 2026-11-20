"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeading } from "@/components/ui/section-heading"
import { LinkButton } from "@/components/ui/link-button"
import { ROUTES } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"
import { Service } from "@/lib/types"

const PAGE_SIZE = 6

export function FeaturedServices() {
  const [data, setData] = useState<{ items: Service[]; total: number; page: number; pages: number } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/services/featured?limit=${PAGE_SIZE}`, {
          method: "GET",
          headers: {},
          credentials: "omit",
        })
        const payload = (await res.json()) as {
          success: boolean
          data?: { items: Service[]; total: number; page: number; pages: number }
          message?: string
        }
        if (!res.ok || !payload?.data) throw new Error(payload?.message ?? "Failed to load")
        if (!cancelled) {
          setData(payload.data)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load featured services.")
          setLoading(false)
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [reloadKey])

  const subtitle = data ? `${data.total} service${data.total === 1 ? "" : "s"} available` : ""

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="rounded-2xl h-64 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No featured services"
        message="Services will appear here once the admin adds them."
      />
    )
  }

  return (
    <section className="py-12">
      <SectionHeading
        title="Featured Services"
        subtitle={subtitle}
        action={
          <LinkButton
            href={ROUTES.services}
            variant="link"
            size="sm"
          >
            View all services
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map((service) => (
          <article
            key={service.id}
            className="card-salon flex h-full flex-col overflow-hidden"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-base-200">
              <Image
                src={service.image}
                alt={service.serviceName}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                className="object-cover"
              />
              <span className="badge badge-sm absolute left-3 top-3 bg-primary text-primary-content">
                {service.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="line-clamp-1 font-heading text-xl">{service.serviceName}</h3>
              <p className="line-clamp-2 text-sm text-base-content/60">{service.description}</p>

              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <span className="font-semibold">{formatPrice(service.price)}</span>
                <span className="flex items-center gap-1 text-sm text-base-content/60">
                  {service.duration} min
                </span>
              </div>

              <Link
                href={`/services/${service.id}`}
                className="btn btn-primary btn-sm mt-4 w-full min-h-11"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}