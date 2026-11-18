import Image from "next/image"

import { Logo } from "@/components/layout/logo"
import { SITE } from "@/lib/constants"

type AuthShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

/**
 * Split-screen wrapper shared by the sign-in and sign-up pages:
 * salon photo on the left, form card on the right (form only on mobile).
 */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:block">
        <Image
          src="/images/banner-color.jpg"
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
        <div className="relative flex h-full flex-col justify-end p-10">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-light uppercase">
            {SITE.tagline}
          </p>
          <p className="mt-3 max-w-sm font-heading text-3xl font-semibold text-balance text-white">
            Your chair is waiting.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="font-heading text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
