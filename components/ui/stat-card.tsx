import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type StatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, loading = false }: StatCardProps) {
  if (loading) return <Skeleton className="h-28 w-full" />

  return (
    <div className="card-salon flex items-center gap-4 p-5">
      {Icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-base-content/60">{label}</p>
        <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
