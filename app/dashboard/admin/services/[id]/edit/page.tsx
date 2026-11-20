import { ServiceEditLoader } from "@/components/admin/service-edit-loader"

const OBJECT_ID = /^[a-fA-F0-9]{24}$/

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!OBJECT_ID.test(id)) {
    return (
      <div className="card-salon mx-auto max-w-xl px-6 py-14 text-center">
        <h1 className="font-heading text-3xl">Invalid service link</h1>
        <p className="mt-2 text-base-content/60">
          That service link is not valid. Please choose a service from the list.
        </p>
      </div>
    )
  }

  return <ServiceEditLoader id={id} />
}
