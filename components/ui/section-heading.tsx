import type { ReactNode } from "react"

type SectionHeadingProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeading({ title, subtitle, action }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="mt-2 text-base-content/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
