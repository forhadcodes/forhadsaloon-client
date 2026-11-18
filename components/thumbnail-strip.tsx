"use client"

import Image from "next/image"

import { cn } from "@/lib/utils"

export type ThumbnailItem = {
  image: string
  alt: string
}

type ThumbnailStripProps = {
  items: ThumbnailItem[]
  activeIndex: number
  onSelect: (index: number) => void
  className?: string
}

/**
 * Small clickable previews that switch a larger image.
 * Generic on purpose: the hero banner uses it today, the service details
 * gallery can reuse it later without a rewrite.
 */
export function ThumbnailStrip({
  items,
  activeIndex,
  onSelect,
  className,
}: ThumbnailStripProps) {
  return (
    <ul
      className={cn(
        "flex items-center gap-3 overflow-x-auto pb-1",
        className
      )}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex

        return (
          <li key={item.image} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Show image: ${item.alt}`}
              aria-pressed={isActive}
              className={cn(
                "relative block h-16 w-24 overflow-hidden rounded-lg ring-2 outline-none transition focus-visible:ring-brand-light sm:h-20 sm:w-32",
                isActive
                  ? "opacity-100 ring-brand-light"
                  : "opacity-60 ring-white/25 hover:opacity-100"
              )}
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
