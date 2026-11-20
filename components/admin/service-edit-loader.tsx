"use client"

import { useEffect, useState } from "react"

import { ServiceForm } from "@/components/admin/service-form"
import { ErrorState } from "@/components/ui/error-state"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiRequestError, servicesApi } from "@/lib/api"
import type { Service } from "@/lib/types"

export function ServiceEditLoader({ id }: { id: string }) {
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
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (notFound || error) {
    return (
      <div className="space-y-4">
        <ErrorState
          message={
            notFound
              ? "Service not found. It may have been removed."
              : (error ?? "We couldn't load this service.")
          }
          onRetry={error ? () => setReloadKey((key) => key + 1) : undefined}
        />
        <div className="flex justify-center">
          <LinkButton href="/dashboard/admin/services" variant="outline">
            Back to Services
          </LinkButton>
        </div>
      </div>
    )
  }

  return service ? (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Edit Service</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Update the details of {service.serviceName}.
        </p>
      </div>
      <ServiceForm service={service} />
    </div>
  ) : null
}
