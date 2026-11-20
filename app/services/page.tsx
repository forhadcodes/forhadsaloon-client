import type { Metadata } from "next"
import { Suspense } from "react"

import { BrowseServices } from "@/components/services/browse-services"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Browse Salon Services",
  description: "Browse salon services and request appointments online.",
}

export default function ServicesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl">Browse Services</h1>
        <p className="mt-2 text-base-content/60">
          Find the service you love and request an appointment in a few clicks.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-2xl" />
            ))}
          </div>
        }
      >
        <BrowseServices />
      </Suspense>
    </div>
  )
}
