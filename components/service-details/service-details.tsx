"use client"

import Image from "next/image"
import { useRef } from "react"
import { CalendarPlus, Clock3, Info } from "lucide-react"

import { BookingForm } from "@/components/appointments/booking-form"
import { Button } from "@/components/ui/button"
import type { Service } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

type ServiceDetailsProps = {
  service: Service
  isAdmin: boolean
}

export function ServiceDetails({ service, isAdmin }: ServiceDetailsProps) {
  const bookingRef = useRef<HTMLDivElement>(null)
  const inactive = service.status === "inactive"

  function focusBookingForm() {
    bookingRef.current?.scrollIntoView({ block: "center" })
    bookingRef.current?.querySelector<HTMLElement>("input, select, textarea")?.focus({
      preventScroll: true,
    })
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="card-salon overflow-hidden">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={service.image}
              alt={service.serviceName}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-primary">{service.category}</span>
            {inactive ? (
              <span className="badge badge-outline">Currently unavailable</span>
            ) : (
              <span className="badge badge-success">Available for booking</span>
            )}
          </div>

          <h1 className="font-heading text-3xl md:text-4xl">{service.serviceName}</h1>
          <p className="leading-relaxed text-base-content/70">{service.description}</p>

          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 border-y border-base-300 py-5">
            <div>
              <p className="text-xs tracking-wide text-base-content/50 uppercase">Price</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-primary">
                {formatPrice(service.price)}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-wide text-base-content/50 uppercase">Duration</p>
              <p className="mt-1 flex items-center gap-1.5 font-medium">
                <Clock3 className="size-4 text-base-content/50" aria-hidden />
                {service.duration} min
              </p>
            </div>
          </div>

          {isAdmin ? (
            <div
              className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info/10 p-4 text-sm"
              role="status"
            >
              <Info className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
              <span>Admins cannot submit appointment requests.</span>
            </div>
          ) : inactive ? (
            <div className="space-y-3">
              <Button type="button" variant="brand" size="lg" disabled>
                <CalendarPlus aria-hidden />
                Book Appointment
              </Button>
              <p className="text-sm text-base-content/60">
                This service is currently unavailable. Please browse our other services.
              </p>
            </div>
          ) : (
            <Button type="button" variant="brand" size="lg" onClick={focusBookingForm}>
              <CalendarPlus aria-hidden />
              Book Appointment
            </Button>
          )}
        </div>
      </div>

      {!isAdmin && !inactive ? (
        <div ref={bookingRef} className="card-salon scroll-mt-24 p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="font-heading text-2xl">Request an appointment</h2>
            <p className="mt-1 text-sm text-base-content/60">
              Choose a date and time. Our team will confirm your request before payment.
            </p>
          </div>
          <BookingForm serviceId={service.id} />
        </div>
      ) : null}
    </div>
  )
}
