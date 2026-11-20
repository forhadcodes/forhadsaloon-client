import { RefreshCw, TriangleAlert } from "lucide-react"

type ErrorStateProps = { message?: string; onRetry?: () => void }

export function ErrorState({
  message = "We could not load this data.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="card-salon flex flex-col items-center gap-3 px-6 py-12 text-center">
      <TriangleAlert className="size-10 text-error" aria-hidden />
      <h3 className="font-heading text-xl">Something went wrong</h3>
      <p className="max-w-md text-sm text-base-content/60">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary btn-sm min-h-11" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden />
          Try again
        </button>
      )}
    </div>
  )
}
