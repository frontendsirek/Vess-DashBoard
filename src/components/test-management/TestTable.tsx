import { useMemo, useState } from 'react'
import { EyeIcon } from '@/components/icons'
import { Checkbox } from '@/components/ui/checkbox'
import { TestStatusBadge } from '@/components/test-management/TestStatusBadge'
import { TestTypeCell } from '@/components/test-management/TestTypeCell'
import { type TestRecord } from '@/data/mock'

type TestTableProps = {
  tests: TestRecord[]
  onView?: (test: TestRecord) => void
}

export function TestTable({ tests, onView }: TestTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = useMemo(
    () => tests.length > 0 && tests.every((test) => selected.has(test.id)),
    [tests, selected],
  )

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(tests.map((test) => test.id)) : new Set())
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-vess-grey-100">
      <table className="w-full min-w-[800px] table-fixed text-left">
        <thead className="bg-vess-grey-100 text-[11px] font-medium leading-[15.6px] text-vess-grey-950">
          <tr>
            <th className="w-10 px-4 py-4">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </th>
            <th className="px-4 py-4 font-medium">Test Name</th>
            <th className="w-28 px-4 py-4 font-medium">Type</th>
            <th className="px-4 py-4 font-medium">Source</th>
            <th className="px-4 py-4 font-medium">Destination</th>
            <th className="w-28 px-4 py-4 font-medium">Last Run</th>
            <th className="w-32 px-4 py-4 font-medium">Status</th>
            <th className="w-24 px-4 py-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-vess-grey-100 bg-vess-grey-50 text-[13px] font-normal leading-[18px] text-vess-grey-950">
          {tests.map((test) => (
            <tr key={test.id} className="hover:bg-vess-grey-100/40">
              <td className="px-4 py-4">
                <Checkbox
                  checked={selected.has(test.id)}
                  onCheckedChange={(checked) => toggleOne(test.id, checked)}
                />
              </td>
              <td className="px-4 py-4 font-medium">{test.name}</td>
              <td className="px-4 py-4">
                <TestTypeCell type={test.type} />
              </td>
              <td className="px-4 py-4">{test.source}</td>
              <td className="px-4 py-4">{test.destination}</td>
              <td className="px-4 py-4 text-vess-grey-500">{test.lastRun}</td>
              <td className="px-4 py-4">
                <TestStatusBadge status={test.status} />
              </td>
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onView?.(test)}
                  className="inline-flex items-center gap-1.5 text-vess-grey-950 transition-colors hover:text-vess-primary-500"
                >
                  <EyeIcon className="size-[18px]" />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
