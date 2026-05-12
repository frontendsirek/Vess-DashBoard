import { SearchIcon } from '@/components/icons'
import { ViewToggle } from '@/components/test-management/ViewToggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type TestManagementView } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

type TestFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  view: TestManagementView
  onViewChange: (view: TestManagementView) => void
}

export function TestFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  view,
  onViewChange,
}: TestFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-4 text-vess-grey-500 sm:max-w-[320px]">
        <SearchIcon className="size-5" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tests…."
          className="flex-1 bg-transparent text-[15px] font-normal leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-400 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={typeFilter}
          options={['All Types', 'Call', 'SMS', 'Data']}
          onChange={onTypeFilterChange}
        />
        <FilterSelect
          value={statusFilter}
          options={['All Status', 'Running', 'Scheduled', 'Completed']}
          onChange={onStatusFilterChange}
        />
        <ViewToggle value={view} onChange={onViewChange} />
      </div>
    </div>
  )
}

function FilterSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'h-11 w-fit max-w-[200px] shrink-0 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-3 text-[15px] font-normal leading-[18px] text-vess-grey-950',
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
