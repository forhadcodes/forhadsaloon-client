import { AppointmentsTable } from "@/components/admin/appointments-table"

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Manage Appointments</h1>
        <p className="mt-1 text-sm text-base-content/60">
          Review booking requests, confirm them and manage cancellations.
        </p>
      </div>

      <AppointmentsTable />
    </div>
  )
}
