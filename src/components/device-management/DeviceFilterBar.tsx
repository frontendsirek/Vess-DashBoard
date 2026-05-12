import { SearchIcon } from '@/components/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type DeviceManagementView } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { DeviceManagementViewToggle } from '@/components/device-management/DeviceManagementViewToggle'

type DeviceFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  view: DeviceManagementView
  onViewChange: (view: DeviceManagementView) => void
}

const statusOptions = ['All Status', 'Online', 'Offline', 'Warning', 'Low Battery'] as const

export function DeviceFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  view,
  onViewChange,
}: DeviceFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex h-12 w-full items-center gap-4 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-vess-grey-500 sm:max-w-[425px]">
        <SearchIcon className="size-6 shrink-0 text-vess-grey-950" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search devices....."
          className="flex-1 bg-transparent text-[15px] font-normal leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-400 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-5">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger
            className={cn(
              'h-12 w-fit max-w-[220px] shrink-0 rounded-lg border-2  border-vess-grey-100 bg-vess-grey-50 px-4 font-medium',
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DeviceManagementViewToggle value={view} onChange={onViewChange} />
      </div>
    </div>
  )
}
