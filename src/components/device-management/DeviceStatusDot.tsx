import type { DeviceManagementStatus } from '@/data/device-management'
import { cn } from '@/lib/utils'

const dotClass: Record<DeviceManagementStatus, string> = {
  Online: 'bg-vess-green-500',
  Offline: 'bg-vess-red-500',
  Warning: 'bg-vess-secondary-500',
  'Low Battery': 'bg-vess-red-500',
}

/** Figma grid card header — status as a colored dot (708:22402). */
export function DeviceStatusDot({ status }: { status: DeviceManagementStatus }) {
  return (
    <span
      className={cn('mt-1 size-2 shrink-0 rounded-full', dotClass[status])}
      title={status}
      aria-label={status}
      role="img"
    />
  )
}
