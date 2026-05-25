import { formatDistanceToNow } from 'date-fns'
import type { DeviceApiDetailOverlay, DeviceManagementStatus, DeviceRecord } from '@/data/device-management'
import {
  batteryLevelFromDevice,
  deviceGroupLabelFromDevice,
  deviceTagsFromDevice,
  hardwareFromDevice,
  isApiDeviceDetail,
  lowBatteryThresholdFromDevice,
  mapDeviceStatusWithBatteryThreshold,
  msisdnRawFromDevice,
  networkOperatorFromDevice,
  networkTypeFromDevice,
  signalStrengthFromDevice,
  testSummaryFromDevice,
} from '@/lib/api-device-detail-accessors'
import type { ApiDevice, ApiDeviceDetail, ApiDeviceMetadata, DeviceStatus } from '@/types/device'

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

export function metaStr(meta: ApiDeviceMetadata | undefined, key: string): string | undefined {
  const raw = meta?.[key]
  if (raw === undefined || raw === null || raw === false) return undefined
  if (typeof raw === 'boolean') return raw ? 'true' : undefined
  const s = String(raw).trim()
  return s.length > 0 ? s : undefined
}

function titleCaseWord(s: string): string {
  const t = s.trim()
  if (!t.length) return t
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

/** Humanizes slug-like tokens for sidebar tags without importing detail helpers. */
function humanizeMetaLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function formatPhoneMsisdnDisplay(raw: string): string {
  const trimmed = raw.trim()
  const digitsOnly = trimmed.replace(/\D/g, '')
  if (digitsOnly.length === 13 && digitsOnly.startsWith('234')) {
    const nsn = digitsOnly.slice(3)
    return `+234 ${nsn.slice(0, 3)} ${nsn.slice(3, 6)} ${nsn.slice(6, 11)}`
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+234 ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`
  }
  return trimmed
}

function parseListBatteryPercent(metadata: ApiDeviceMetadata | undefined): number {
  const raw = metadata?.battery_level ?? metadata?.battery_percent
  if (raw === undefined || raw === null || raw === '') return 100
  const n =
    typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
}

function mapDeviceStatusToManagement(
  status: DeviceStatus,
  batteryPercent: number,
  lowBatteryThreshold = 20,
): DeviceManagementStatus {
  return mapDeviceStatusWithBatteryThreshold(status, batteryPercent, lowBatteryThreshold)
}

/** Shared list + summary fields — no heavy detail overlay */
function mapCoreApiDevice(device: ApiDevice | ApiDeviceDetail): Omit<DeviceRecord, 'apiDetailOverlay'> {
  const metadata = isApiDeviceDetail(device) ? undefined : (device.metadata ?? {})
  const batteryFromApi = batteryLevelFromDevice(device)
  const batteryPercent = batteryFromApi ?? parseListBatteryPercent(metadata)
  const lowBatteryThreshold = lowBatteryThresholdFromDevice(device)

  let badgePrimary = slugFromLocation(device.location)
  let badgeSecondary: string | undefined
  let deviceTypeLabel = 'Device'

  if (isApiDeviceDetail(device)) {
    const group = deviceGroupLabelFromDevice(device)
    if (group) badgeSecondary = humanizeMetaLabel(group)
    const hardware = hardwareFromDevice(device)
    if (hardware.model?.trim()) deviceTypeLabel = hardware.model.trim()
  } else {
    badgePrimary = metaStr(metadata, 'site_slug') ?? badgePrimary
    const tier = metaStr(metadata, 'tier')
    const grp = metaStr(metadata, 'group')
    if (tier && tier.length > 0) badgeSecondary = tier
    else if (grp && grp.length > 0) badgeSecondary = grp
    const deviceType = metaStr(metadata, 'device_type')
    if (deviceType) deviceTypeLabel = deviceType
  }

  const networkType = networkTypeFromDevice(device) ?? '—'

  return {
    id: device.device_id,
    name: device.device_name,
    badgePrimary,
    badgeSecondary: badgeSecondary ?? undefined,
    location: device.location,
    deviceType: deviceTypeLabel,
    networkType,
    lastSeen: formatRelativeLastSeen(device.last_heartbeat),
    status: mapDeviceStatusToManagement(device.status, batteryPercent, lowBatteryThreshold),
    batteryPercent,
    latitude: device.latitude,
    longitude: device.longitude,
  }
}

/** Builds detail overlay used by `/device-management/:id` — list views omit this. */
export function buildDeviceApiDetailOverlay(device: ApiDeviceDetail): DeviceApiDetailOverlay {
  const hardware = hardwareFromDevice(device)
  const manufacturer = hardware.manufacturer?.trim()
  const model = hardware.model?.trim()

  let hardwareSubtitle: string | undefined
  if (manufacturer && model) hardwareSubtitle = `${titleCaseWord(manufacturer)} ${model}`
  else if (model) hardwareSubtitle = model
  else if (manufacturer) hardwareSubtitle = titleCaseWord(manufacturer)

  const os = hardware.os?.trim()
  const osVersion = hardware.os_version?.trim()
  const androidDisplay =
    os && osVersion ? `${os} ${osVersion}`
    : osVersion ? `Android ${osVersion}`
    : os ? os
    : undefined

  const appVersion = hardware.app_version?.trim() || undefined
  const signalDbm = signalStrengthFromDevice(device) ?? undefined
  const storageAvailableMb = device.health_metrics?.storage?.available_mb
  const rawPhone = msisdnRawFromDevice(device)
  const msisdnDisplay =
    rawPhone && rawPhone.length > 0 ? formatPhoneMsisdnDisplay(rawPhone) : undefined
  const networkOperator = networkOperatorFromDevice(device)

  const summary = testSummaryFromDevice(device)
  let totalTests: number | undefined
  let successRatePercent: number | undefined
  let successfulCount: number | undefined
  let failedCount: number | undefined
  let lastTestLine: string | undefined

  if (summary && typeof summary.total_tests === 'number') {
    totalTests = Math.max(0, Math.floor(summary.total_tests))
    successfulCount = Math.max(0, Math.floor(summary.successful_tests ?? 0))
    failedCount = Math.max(0, Math.floor(summary.failed_tests ?? 0))
    const rateRaw =
      typeof summary.success_rate === 'number' && Number.isFinite(summary.success_rate) ?
        summary.success_rate
      : totalTests > 0 ?
        (successfulCount / totalTests) * 100
      : 0
    successRatePercent = Math.round(Math.min(100, Math.max(0, rateRaw)))

    if (summary.avg_network_speed_mbps != null && Number.isFinite(summary.avg_network_speed_mbps)) {
      lastTestLine = `Avg speed: ${summary.avg_network_speed_mbps.toFixed(1)} Mbps`
    }
  }

  const groupRaw = deviceGroupLabelFromDevice(device)
  const sidebarGroup = groupRaw ? humanizeMetaLabel(groupRaw) : undefined
  const sidebarTags = deviceTagsFromDevice(device).map((tag) => humanizeMetaLabel(tag))

  return {
    hardwareSubtitle,
    androidDisplay,
    appVersion,
    signalDbm,
    storageAvailableMb:
      typeof storageAvailableMb === 'number' && Number.isFinite(storageAvailableMb) ?
        storageAvailableMb
      : undefined,
    networkOperator,
    msisdnDisplay,
    totalTests,
    successRatePercent,
    successfulCount,
    failedCount,
    lastTestLine,
    sidebarGroup,
    sidebarTags: sidebarTags.length > 0 ? sidebarTags : undefined,
  }
}

/**
 * Maps device-service `ApiDevice` into UI `DeviceRecord` (lists, search rows).
 */
export function mapApiDeviceToDeviceRecord(device: ApiDevice): DeviceRecord {
  return { ...mapCoreApiDevice(device) }
}

/** Same core mapping as lists, plus detail overlay from GET `/devices/:id/` body. */
export function mapApiDeviceToDeviceDetailRecord(device: ApiDeviceDetail): DeviceRecord {
  return {
    ...mapCoreApiDevice(device),
    apiDetailOverlay: buildDeviceApiDetailOverlay(device),
  }
}
