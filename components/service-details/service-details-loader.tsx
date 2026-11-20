"use client"

import { useEffect, useState } from "react"

import { ServiceDetails } from "@/components/service-details/service-details"
import { ErrorState } from "@/components/ui/error-state"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiRequestError, servicesApi } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import type { Service } from "@/lib/types"

/** Fetches in the browser so the Better Auth cookie/JWT is available. */
export function ServiceDetailsLoader({ id, isAdmin }: { id: string; isAdmin: boolean }) {
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const data = await servicesApi.byId(id, controller.signal)
        if (active) setService(data)
      } catch (err: unknown) {
        if (!active || controller.signal.aborted) return
        if (err instanceof ApiRequestError && (err.status === 400 || err.status === 404)) {
          setNotFound(true)
        } else {
          setError(err instanceof Error ? err.message : "We couldn't load this service.")
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
  }, [id, reloadKey])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="card-salon mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-14 text-center">
        <h1 className="font-heading text-3xl">Service not found</h1>
        <p className="text-base-content/60">
          This service is no longer available. Browse our other services.
        </p>
        <LinkButton href={ROUTES.services} variant="brand" size="lg">
          Back to Services
        </LinkButton>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
  }

  return service ? <ServiceDetails service={service} isAdmin={isAdmin} /> : null
}
