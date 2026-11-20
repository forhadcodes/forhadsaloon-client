"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, CalendarCheck, CircleX, Clock3 } from "lucide-react"

import { ErrorState } from "@/components/ui/error-state"
import { StatCard } from "@/components/ui/stat-card"
import { ApiRequestError, appointmentsApi } from "@/lib/api"
import type { AppointmentStats } from "@/lib/types"

export function CustomerOverview() {
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setError(null)
      try {
        const data = await appointmentsApi.stats(controller.signal)
        if (!cancelled) setStats(data)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof ApiRequestError ? err.message : "Could not load your dashboard.")
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [reloadKey])

  const loading = !stats && !error

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Welcome back</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Here is a quick look at your salon appointment requests.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            loading={loading}
            label="Total Appointment Requests"
            value={stats?.total ?? 0}
            icon={CalendarCheck}
          />
          <StatCard loading={loading} label="Pending" value={stats?.pending ?? 0} icon={Clock3} />
          <StatCard
            loading={loading}
            label="Confirmed"
            value={stats?.confirmed ?? 0}
            icon={BadgeCheck}
          />
          <StatCard
            loading={loading}
            label="Cancelled"
            value={stats?.cancelled ?? 0}
            icon={CircleX}
          />
        </div>
      )}
    </div>
  )
}
