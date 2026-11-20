import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock3 } from "lucide-react"
import type { Service } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card-salon flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-base-200">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="badge badge-sm absolute left-3 top-3 bg-primary text-primary-content">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-1 font-heading text-xl">{service.serviceName}</h3>
        <p className="line-clamp-2 text-sm text-base-content/60">{service.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="font-semibold">{formatPrice(service.price)}</span>
          <span className="flex items-center gap-1 text-sm text-base-content/60">
            <Clock3 className="size-4" aria-hidden />
            {service.duration} min
          </span>
        </div>

        <Link
          href={`/services/${service.id}`}
          className="btn btn-primary btn-sm mt-4 w-full min-h-11"
        >
          View Details
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
