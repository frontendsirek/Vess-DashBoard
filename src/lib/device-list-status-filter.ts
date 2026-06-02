import type { DeviceStatus } from '@/types/device'

export const DEVICE_LIST_STATUS_FILTER_ALL = 'all' as const

export type DeviceListStatusFilter = typeof DEVICE_LIST_STATUS_FILTER_ALL | DeviceStatus

export const DEVICE_LIST_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  label: string
  value: DeviceListStatusFilter
}> = [
  { label: 'All Status', value: DEVICE_LIST_STATUS_FILTER_ALL },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Offline', value: 'OFFLINE' },
  { label: 'Stale', value: 'STALE' },
  { label: 'Testing', value: 'TESTING' },
  { label: 'Degraded', value: 'DEGRADED' },
]

export function deviceListStatusFilterToApiParam(
  filter: DeviceListStatusFilter,
): DeviceStatus | undefined {
  if (filter === DEVICE_LIST_STATUS_FILTER_ALL) return undefined
  return filter
}
