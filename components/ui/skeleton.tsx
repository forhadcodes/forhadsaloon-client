type SkeletonProps = { className?: string }

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-base-300 ${className}`} />
}
