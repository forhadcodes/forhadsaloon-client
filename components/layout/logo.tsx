import Image from "next/image"
import Link from "next/link"

import { ROUTES, SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

/**
 * Brand mark used in the navbar, footer and dashboard sidebar.
 * The source artwork already contains the salon name, so no extra text is
 * rendered next to it.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${SITE.name} — home`}
      className={cn(
        "flex shrink-0 items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <Image
        src={SITE.logo}
        alt={SITE.name}
        width={795}
        height={429}
        loading="eager"
        fetchPriority="high"
        className="h-11 w-auto object-contain transition-opacity hover:opacity-80 md:h-14"
      />
    </Link>
  )
}
