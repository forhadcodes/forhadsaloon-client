import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { LinkButton } from "@/components/ui/link-button"
import { HERO } from "@/lib/constants"

/**
 * Home page hero.
 *
 * A single local photo (never hotlinked) fills the section and the gradient
 * overlay keeps the white copy readable at every breakpoint. The photo is the
 * LCP element, so it is marked priority and given an explicit sizes value.
 */
export function Banner() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-neutral">
      <Image
        src={HERO.image}
        alt={HERO.alt}
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-black/85 via-black/60 to-black/25"
      />

      <div className="mx-auto flex min-h-[440px] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:min-h-[520px] sm:px-6 lg:min-h-[600px] lg:px-8">
        <div className="max-w-2xl border-l-2 border-brand-light/70 pl-5 sm:pl-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-white/80 uppercase sm:text-sm">
            {HERO.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="mt-4 font-heading text-4xl font-semibold text-balance text-white sm:text-5xl lg:text-6xl"
          >
            {HERO.title}
          </h1>

          <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">{HERO.description}</p>

          <LinkButton
            href={HERO.cta.href}
            variant="brand"
            size="lg"
            className="mt-8 h-11 px-5 text-sm"
          >
            {HERO.cta.label}
            <ArrowRight aria-hidden />
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
