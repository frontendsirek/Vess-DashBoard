import { PlusIcon } from '@/components/icons'

type TestManagementHeaderProps = {
  onNewTest?: () => void
}

export function TestManagementHeader({ onNewTest }: TestManagementHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-[31px] font-medium leading-[37.2px] text-vess-grey-950">
        Test Management
      </h1>
      <button
        type="button"
        onClick={onNewTest}
        className="inline-flex items-center gap-2 rounded-xl bg-vess-primary-500 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
      >
        <PlusIcon className="size-5" />
        <span>New Test</span>
      </button>
    </div>
  )
}
