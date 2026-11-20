import { TransactionsTable } from "@/components/admin/transactions-table"

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Transactions</h1>
        <p className="mt-1 text-sm text-base-content/60">
          A read-only record of all payments received through Stripe.
        </p>
      </div>

      <TransactionsTable />
    </div>
  )
}
