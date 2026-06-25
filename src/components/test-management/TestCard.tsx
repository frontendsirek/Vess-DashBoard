import { EyeIcon } from '@/components/icons'
import { ManagementCardRow } from '@/components/shared/ManagementCardRow'
import { TestStatusBadge } from '@/components/test-management/TestStatusBadge'
import { TestTypeCell } from '@/components/test-management/TestTypeCell'
import { type TestRecord } from '@/data/mock'

type TestCardProps = {
  test: TestRecord
  onView?: (test: TestRecord) => void
}

export function TestCard({ test, onView }: TestCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-vess-grey-100 bg-vess-grey-50">
      <header className="border-b border-vess-grey-100 px-4 py-4">
        <h3 className="text-[13px] font-medium leading-[18px] text-vess-grey-950">
          {test.name}
        </h3>
      </header>
      <dl className="flex flex-col gap-3 px-4 py-4 text-[13px] leading-[18px]">
        <ManagementCardRow label="Type">
          <TestTypeCell type={test.type} />
        </ManagementCardRow>
        <ManagementCardRow label="Source">
          <span>{test.source}</span>
        </ManagementCardRow>
        <ManagementCardRow label="Destination">
          <span>{test.destination}</span>
        </ManagementCardRow>
        <ManagementCardRow label="Last Run">
          <span>{test.lastRun}</span>
        </ManagementCardRow>
      </dl>
      <div className="flex items-center justify-between border-t border-vess-grey-100 px-4 py-3 text-[13px] leading-[18px]">
        <span className="font-normal text-vess-grey-500">Status</span>
        <TestStatusBadge status={test.status} />
      </div>
      <div className="flex items-center justify-between border-t border-vess-grey-100 px-4 py-3 text-[13px] leading-[18px]">
        <span className="font-normal text-vess-grey-500">Action</span>
        <button
          type="button"
          onClick={() => onView?.(test)}
          className="inline-flex items-center gap-1.5 text-vess-grey-950 transition-colors hover:text-vess-primary-500"
        >
          <EyeIcon className="size-[18px]" />
          <span>View</span>
        </button>
      </div>
    </article>
  )
}
