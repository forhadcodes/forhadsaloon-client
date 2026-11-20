import { CirclePlus } from "lucide-react"

import { ServicesTable } from "@/components/admin/services-table"
import { LinkButton } from "@/components/ui/link-button"

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl">Manage Services</h1>
          <p className="mt-1 text-sm text-base-content/60">
            Create, edit and activate the services customers can book.
          </p>
        </div>
        <LinkButton href="/dashboard/admin/services/new" variant="brand" size="lg">
          <CirclePlus aria-hidden />
          Add Service
        </LinkButton>
      </div>

      <ServicesTable />
    </div>
  )
}
