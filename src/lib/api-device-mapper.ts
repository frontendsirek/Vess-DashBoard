import { formatDistanceToNow } from 'date-fns'
import type { DeviceManagementStatus, DeviceRecord } from '@/data/device-management'
import type { ApiDevice, DeviceStatus } from '@/services/device.service'

function slugFromLocation(location: string): string {
  const s = location
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return s.length > 0 ? s : 'device'
}

export function formatRelativeLastSeen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return '—'
  }
}

function parseBatteryPercent(metadata: Record<string, string>): number {
  const raw = metadata.battery_level ?? metadata.battery_percent
  if (raw === undefined || raw === '') return 100
  const n = Number.parseInt(String(raw), 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
}

function networkTypeLabel(metadata: Record<string, string>): string {
  const n = metadata.network_type ?? metadata.network
  return n && n.length > 0 ? n : '—'
}

function mapDeviceStatusToManagement(
  status: DeviceStatus,
  batteryPercent: number,
): DeviceManagementStatus {
  if (status === 'OFFLINE') return 'Offline'
  if (batteryPercent > 0 && batteryPercent <= 20) return 'Low Battery'
  if (status === 'STALE' || status === 'DEGRADED') return 'Warning'
  return 'Online'
}

/**
 * Maps device-service `ApiDevice` into UI `DeviceRecord`.
 * Optional `metadata`: `battery_level`, `battery_percent`, `network_type`, `network`,
 * `tier`, `group`, `device_type`, `site_slug`.
 */
export function mapApiDeviceToDeviceRecord(device: ApiDevice): DeviceRecord {
  const batteryPercent = parseBatteryPercent(device.metadata)
  const badgePrimary =
    device.metadata.site_slug && device.metadata.site_slug.length > 0
      ? device.metadata.site_slug
      : slugFromLocation(device.location)
  const badgeSecondary = device.metadata.tier ?? device.metadata.group
  return {
    id: device.device_id,
    name: device.device_name,
    badgePrimary,
    badgeSecondary: badgeSecondary && badgeSecondary.length > 0 ? badgeSecondary : undefined,
    location: device.location,
    deviceType:
      device.metadata.device_type && device.metadata.device_type.length > 0
        ? device.metadata.device_type
        : 'Device',
    networkType: networkTypeLabel(device.metadata),
    lastSeen: formatRelativeLastSeen(device.last_heartbeat),
    status: mapDeviceStatusToManagement(device.status, batteryPercent),
    batteryPercent,
    latitude: device.latitude,
    longitude: device.longitude,
  }
}
