const badgeStyles: Record<string, string> = {
  pending: "badge-warning",
  confirmed: "badge-info",
  cancelled: "badge-error",
  paid: "badge-success",
  unpaid: "badge-outline",
  active: "badge-success",
  inactive: "badge-outline",
  blocked: "badge-error",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-sm capitalize ${badgeStyles[status] ?? "badge-ghost"}`}>
      {status}
    </span>
  )
}
