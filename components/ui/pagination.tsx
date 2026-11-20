import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 py-6" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-outline btn-sm min-h-11"
        disabled={page <= 1}
        aria-label="Previous page"
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <span className="px-2 text-sm text-base-content/70" aria-live="polite">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        className="btn btn-outline btn-sm min-h-11"
        disabled={page >= pages}
        aria-label="Next page"
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
