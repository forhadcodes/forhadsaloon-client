import { Search, CalendarPlus, BadgeCheck, CreditCard, type LucideIcon } from "lucide-react"

const steps: { number: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    number: "01",
    title: "Browse",
    description: "Search and filter salon services by category, price, or name.",
    icon: Search,
  },
  {
    number: "02",
    title: "Request",
    description: "Pick a date and time slot, add a message for the stylist.",
    icon: CalendarPlus,
  },
  {
    number: "03",
    title: "Get Confirmed",
    description: "Your stylist confirms the appointment and you receive a notification.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "Pay Securely",
    description: "Pay with Stripe once the appointment is confirmed. No upfront charges.",
    icon: CreditCard,
  },
]

export function HowItWorks() {
  return (
    <section className="bg-base-200 py-12 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-center text-3xl md:text-4xl">How It Works</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="card-salon flex flex-col items-center p-6 text-center"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-6" aria-hidden />
              </span>
              <span className="mt-4 text-xs font-semibold tracking-widest text-base-content/40">
                STEP {step.number}
              </span>
              <h3 className="mt-1 font-heading text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-base-content/60">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
