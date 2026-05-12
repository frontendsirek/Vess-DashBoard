import type { DeviceManagementStatus } from '@/data/device-management'
import { cn } from '@/lib/utils'

const statusClass: Record<DeviceManagementStatus, string> = {
  Online: 'bg-vess-green-50 text-vess-green-500',
  Offline: 'bg-vess-red-50 text-vess-red-500',
  Warning: 'bg-vess-secondary-50 text-vess-secondary-500',
  'Low Battery': 'bg-vess-secondary-50 text-vess-secondary-500',
}

export function DeviceStatusBadge({ status }: { status: DeviceManagementStatus }) {
  return (
    <span
      className={cn(
        'inline-flex min-w- justify-center rounded-full px-3 py-1 text-[15px] font-normal leading-[18px]',
        statusClass[status],
      )}
    >
      {status}
    </span>
  )
}
