import type { ReactNode } from "react"

export type DataTableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  empty?: ReactNode
}

export function DataTable<T>({ columns, data, rowKey, empty }: DataTableProps<T>) {
  if (data.length === 0) return <>{empty ?? null}</>

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-base-300 md:block">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div key={rowKey(row)} className="card-salon space-y-2 p-4">
            {columns.map((column) => (
              <div key={column.key} className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  {column.header}
                </span>
                <div className="text-sm">{column.render(row)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
