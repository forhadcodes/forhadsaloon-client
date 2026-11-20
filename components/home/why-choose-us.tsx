"use client"

import { HeartHandshake, ShieldCheck, CalendarCheck, Sparkles } from "lucide-react"

export function WhyChooseUs() {
  return (
    <section className="py-12 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <ShieldCheck className="size-6 mb-3 text-primary" aria-hidden />
            <h3 className="font-heading text-xl">Trusted professionals</h3>
            <p className="text-base-content/60 text-sm">
              All our stylists are certified and experienced, with ongoing training to
              stay current with the latest trends and techniques.
            </p>
          </div>
          <div>
            <CalendarCheck className="size-6 mb-3 text-primary" aria-hidden />
            <h3 className="font-heading text-xl">Live availability</h3>
            <p className="text-base-content/60 text-sm">
              Real‑time slot tracking means you only see times that are actually open.
            </p>
          </div>
          <div>
            <Sparkles className="size-6 mb-3 text-primary" aria-hidden />
            <h3 className="font-heading text-xl">Secure payments</h3>
            <p className="text-base-content/60 text-sm">
              Stripe‑processed payments with bank‑grade encryption. Your data is never
              stored on our servers.
            </p>
          </div>
          <div>
            <HeartHandshake className="size-6 mb-3 text-primary" aria-hidden />
            <h3 className="font-heading text-xl">Premium products</h3>
            <p className="text-base-content/60 text-sm">
              We use only top‑tier haircare and skincare brands so your results last.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}