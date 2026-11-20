import Link from "next/link"
import { Camera, Clock3, Globe, Mail, MapPin, Phone, Play, Send } from "lucide-react"

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Globe },
  { label: "Instagram", href: "https://instagram.com", icon: Camera },
  { label: "X / Twitter", href: "https://x.com", icon: Send },
  { label: "YouTube", href: "https://youtube.com", icon: Play },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Link href="/" className="font-heading text-2xl font-semibold text-primary">
            SalonBook
          </Link>
          <p className="max-w-xs text-sm text-base-content/60">
            A calm, simple way to discover salon services, request an appointment and pay securely
            online.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-primary" href="/">Home</Link></li>
            <li><Link className="hover:text-primary" href="/services">Browse Services</Link></li>
            <li><Link className="hover:text-primary" href="/sign-in">Sign In</Link></li>
            <li><Link className="hover:text-primary" href="/sign-up">Sign Up</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="mb-3 font-semibold uppercase tracking-wide">Visit & Contact</h3>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            12 Garden Street, Suite 200, Dhaka
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-primary" aria-hidden />
            <a className="hover:text-primary" href="tel:+8801000000000">+880 1000-000000</a>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-primary" aria-hidden />
            <a className="hover:text-primary" href="mailto:hello@salonbook.example">hello@salonbook.example</a>
          </p>
          <p className="flex items-center gap-2 text-base-content/70">
            <Clock3 className="size-4 shrink-0 text-primary" aria-hidden />
            Sat–Thu: 9:00 AM – 8:00 PM · Fri: Closed
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Follow Us</h3>
          <div className="flex gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-11 place-items-center rounded-xl border border-base-300 bg-base-100 hover:border-primary hover:text-primary"
              >
                <Icon className="size-5" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-base-300 py-4 text-center text-sm text-base-content/60">
        © {new Date().getFullYear()} SalonBook. All rights reserved.
      </div>
    </footer>
  )
}
