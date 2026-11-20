import { ServiceForm } from "@/components/admin/service-form"

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Add Service</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Create a new service that customers can browse and book.
        </p>
      </div>

      <ServiceForm />
    </div>
  )
}
