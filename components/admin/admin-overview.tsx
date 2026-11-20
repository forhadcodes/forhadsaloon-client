"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  Scissors,
  Users,
} from "lucide-react"

import { ErrorState } from "@/components/ui/error-state"
import { StatCard } from "@/components/ui/stat-card"
import { ApiRequestError, profileApi } from "@/lib/api"
import type { AdminStats } from "@/lib/types"

const EMPTY_STATS: AdminStats = {
  totalCustomers: 0,
  totalActiveServices: 0,
  totalAppointments: 0,
  pendingAppointments: 0,
  confirmedAppointments: 0,
  totalSuccessfulPayments: 0,
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await profileApi.stats(controller.signal)
        if (!cancelled) setStats(data)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof ApiRequestError ? err.message : "Could not load overview statistics.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [reloadKey])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Admin Overview</h1>
        <p className="mt-1 text-sm text-base-content/60">
          A snapshot of activity across SalonBook.
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Registered Customers"
            value={stats.totalCustomers}
            icon={Users}
            loading={loading}
          />
          <StatCard
            label="Total Active Services"
            value={stats.totalActiveServices}
            icon={Scissors}
            loading={loading}
          />
          <StatCard
            label="Total Appointment Requests"
            value={stats.totalAppointments}
            icon={ClipboardList}
            loading={loading}
          />
          <StatCard
            label="Pending Appointments"
            value={stats.pendingAppointments}
            icon={Clock}
            loading={loading}
          />
          <StatCard
            label="Confirmed Appointments"
            value={stats.confirmedAppointments}
            icon={CheckCircle2}
            loading={loading}
          />
          <StatCard
            label="Total Successful Payments"
            value={stats.totalSuccessfulPayments}
            icon={DollarSign}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
