import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center">
      <ShieldAlert className="size-12 text-error" aria-hidden />
      <h1>Access denied</h1>
      <p className="max-w-md text-base-content/60">
        You do not have permission to view this page (403).
      </p>
      <Link href="/" className="btn btn-primary min-h-11">
        Back to home
      </Link>
    </div>
  )
}
