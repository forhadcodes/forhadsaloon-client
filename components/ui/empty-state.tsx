import { Inbox } from "lucide-react"

type EmptyStateProps = { title?: string; message?: string }

export function EmptyState({
  title = "Nothing here yet",
  message = "Check back later for new results.",
}: EmptyStateProps) {
  return (
    <div className="card-salon flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Inbox className="size-10 text-base-content/40" aria-hidden />
      <h3 className="font-heading text-xl">{title}</h3>
      <p className="max-w-md text-sm text-base-content/60">{message}</p>
    </div>
  )
}
