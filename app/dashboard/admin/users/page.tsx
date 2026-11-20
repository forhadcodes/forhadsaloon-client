import { UsersTable } from "@/components/admin/users-table"

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Manage Users</h1>
        <p className="mt-1 text-sm text-base-content/60">
          View registered customers and manage their account access.
        </p>
      </div>

      <UsersTable />
    </div>
  )
}
