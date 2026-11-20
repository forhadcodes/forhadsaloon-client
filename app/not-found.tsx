import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1>Page not found</h1>
      <p className="max-w-md text-base-content/60">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className="btn btn-primary min-h-11">
        Back to home
      </Link>
    </div>
  )
}
