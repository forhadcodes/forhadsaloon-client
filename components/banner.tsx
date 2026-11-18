"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"

import { ThumbnailStrip } from "@/components/thumbnail-strip"
import { LinkButton } from "@/components/ui/link-button"
import { BANNER_CTA, BANNER_SLIDES } from "@/lib/constants"
import { cn } from "@/lib/utils"

/**
 * Home page hero.
 *
 * All slide images are stacked and crossfaded with opacity, so switching
 * costs no layout shift and the browser already has the next image decoded.
 * Thumbnails below the banner drive the same index.
 */
export function Banner() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSlide = BANNER_SLIDES[activeIndex]

  return (
    <section
      aria-label="Salon highlights"
      className="relative isolate overflow-hidden bg-neutral-950"
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        {BANNER_SLIDES.map((slide, index) => (
          <Image
            key={slide.image}
            src={slide.image}
            alt=""
            fill
            sizes="100vw"
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className={cn(
              "object-cover object-center transition-opacity duration-700 ease-out",
              index === activeIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Keeps white headline text readable over busy photos. */}
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/25" />
      </div>

      <div className="mx-auto flex min-h-[520px] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:min-h-[600px] lg:px-8">
        <div
          key={activeIndex}
          className="max-w-2xl border-l-2 border-brand-light/70 pl-5 duration-500 ease-out animate-in fade-in slide-in-from-bottom-2 sm:pl-6"
        >
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-light uppercase sm:text-sm">
            {activeSlide.eyebrow}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold text-balance text-white sm:text-5xl lg:text-6xl">
            {activeSlide.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
            {activeSlide.description}
          </p>

          <LinkButton
            href={BANNER_CTA.href}
            variant="brand"
            size="lg"
            className="mt-8 h-11 px-5 text-sm"
          >
            {BANNER_CTA.label}
            <ArrowRightIcon aria-hidden />
          </LinkButton>
        </div>

        <ThumbnailStrip
          items={BANNER_SLIDES}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          className="mt-12 md:mt-16"
        />
      </div>
    </section>
  )
}
