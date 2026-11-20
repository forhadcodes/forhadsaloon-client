"use client"

import { CalendarPlus, BadgeCheck, Clock3, Wallet } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Browse",
      description: "Search and filter salon services by category, price, or name.",
    },
    {
      number: "02",
      title: "Request",
      description: "Pick a date and time slot, add a message for the stylist.",
    },
    {
      number: "03",
      title: "Get Confirmed",
      description: "Your stylist confirms the appointment and you receive a notification.",
    },
    {
      number: "04",
      title: "Pay Securely",
      description: "Pay with Stripe once the appointment is confirmed. No upfront charges.",
    },
  ]

  return (
    <section className="py-12 bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="border rounded-2xl p-4 text-center transition-colors duration-150 hover:bg-base-100"
            >
              <div className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary text-primary-content">
                {step.number}
              </div>

              <h3 className="font-heading text-xl mt-2">{step.title}</h3>
              <p className="text-base-content/60 text-sm">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}