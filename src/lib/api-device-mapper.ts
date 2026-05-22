import { formatDistanceToNow } from 'date-fns'
import type { DeviceApiDetailOverlay, DeviceManagementStatus, DeviceRecord } from '@/data/device-management'
import type {
  ApiDevice,
  ApiDeviceDetail,
  ApiDeviceDetailMetadata,
  ApiDeviceMetadata,
  DeviceStatus,
} from '@/types/device'

/** Metadata from list/search or device detail payloads */
type ApiDeviceMapperMetadata = ApiDeviceMetadata | ApiDeviceDetailMetadata

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

export function metaStr(meta: ApiDeviceMapperMetadata | undefined, key: string): string | undefined {
  const raw = meta?.[key]
  if (raw === undefined || raw === null || raw === false) return undefined
  if (typeof raw === 'boolean') return raw ? 'true' : undefined
  const s = String(raw).trim()
  return s.length > 0 ? s : undefined
}

function metaNum(meta: ApiDeviceMapperMetadata | undefined, key: string): number | undefined {
  const raw = meta?.[key]
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined
  if (typeof raw === 'string') {
    const n = Number.parseFloat(raw.trim())
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
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

function summarizeFirstRecentTest(entry: unknown): string | undefined {
  if (!entry || typeof entry !== 'object') return undefined
  const o = entry as Record<string, unknown>
  const outcome =
    typeof o.outcome === 'string' ? o.outcome
    : typeof o.result === 'string' ? o.result
    : undefined
  const kind =
    typeof o.kind === 'string' ? o.kind
    : typeof o.test_type === 'string' ? o.test_type
    : 'Test'
  const time =
    typeof o.completed_at === 'string' ? o.completed_at
    : typeof o.created_at === 'string' ? o.created_at
    : typeof o.updated_at === 'string' ? o.updated_at
    : undefined

  const parts = [time, `${kind}`, outcome ? `(${outcome})` : undefined].filter(Boolean)
  const line = parts.join(' ')
  return line.length > 0 ? line : undefined
}

function parseBatteryPercent(metadata: ApiDeviceMapperMetadata | undefined): number {
  const raw = metadata?.battery_level ?? metadata?.battery_percent
  if (raw === undefined || raw === null || raw === '') return 100
  const n =
    typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
}

function networkTypeLabel(metadata: ApiDeviceMapperMetadata | undefined): string {
  const n = metaStr(metadata, 'network_type') ?? metaStr(metadata, 'network')
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

/** Shared list + summary fields — no heavy detail overlay */
function mapCoreApiDevice(device: ApiDevice | ApiDeviceDetail): Omit<DeviceRecord, 'apiDetailOverlay'> {
  const m = device.metadata ?? {}
  const batteryPercent = parseBatteryPercent(device.metadata)
  const badgePrimary =
    metaStr(device.metadata, 'site_slug') ??
    slugFromLocation(device.location)
  const tier = metaStr(m, 'tier')
  const grp = metaStr(m, 'group')

  let badgeSecondary: string | undefined
  if (tier && tier.length > 0) badgeSecondary = tier
  else if (grp && grp.length > 0) badgeSecondary = grp

  const deviceTypeLabel = metaStr(m, 'device_type')

  return {
    id: device.device_id,
    name: device.device_name,
    badgePrimary,
    badgeSecondary: badgeSecondary ?? undefined,
    location: device.location,
    deviceType: deviceTypeLabel ?? 'Device',
    networkType: networkTypeLabel(device.metadata),
    lastSeen: formatRelativeLastSeen(device.last_heartbeat),
    status: mapDeviceStatusToManagement(device.status, batteryPercent),
    batteryPercent,
    latitude: device.latitude,
    longitude: device.longitude,
  }
}

/** Builds detail overlay used by `/device-management/:id` — list views omit this. */
export function buildDeviceApiDetailOverlay(device: ApiDeviceDetail): DeviceApiDetailOverlay {
  const m = device.metadata ?? {}

  const manufacturer = metaStr(m, 'manufacturer')
  const model = metaStr(m, 'model')
  let hardwareSubtitle: string | undefined
  if (manufacturer && model) hardwareSubtitle = `${titleCaseWord(manufacturer)} ${model}`
  else if (model) hardwareSubtitle = model
  else if (manufacturer) hardwareSubtitle = titleCaseWord(manufacturer)

  const av = metaStr(m, 'android_version')
  const androidDisplay = av ? `Android ${av}` : undefined

  const appMeta = metaStr(m, 'app_version')
  const appHealth =
    device.health?.app_version !== undefined ?
      String(device.health.app_version).trim()
    : undefined
  const appVersion = appMeta ?? (appHealth && appHealth.length > 0 ? appHealth : undefined)

  const signalDbm = metaNum(m, 'signal_strength')

  const storageMbFromMeta = metaNum(m, 'storage_available_mb')
  const storageFromHealth =
    device.health?.storage_available_mb !== undefined &&
    Number.isFinite(device.health.storage_available_mb) ?
      device.health.storage_available_mb
    : undefined
  const storageAvailableMb = storageMbFromMeta ?? storageFromHealth ?? undefined

  const rawPhone = metaStr(m, 'phone_number')
  const msisdnDisplay =
    rawPhone && rawPhone.length > 0 ? formatPhoneMsisdnDisplay(rawPhone) : undefined

  const networkOperator =
    metaStr(m, 'network_operator') ??
    metaStr(m, 'carrier') ??
    metaStr(m, 'sim_operator')

  const stats = device.statistics
  let totalTests: number | undefined
  let successRatePercent: number | undefined
  let successfulCount: number | undefined
  let failedCount: number | undefined
  let lastTestLine: string | undefined

  if (stats && typeof stats.total_tests === 'number' && Number.isFinite(stats.total_tests)) {
    totalTests = Math.max(0, Math.floor(stats.total_tests))
    const rateRaw =
      typeof stats.success_rate === 'number' && Number.isFinite(stats.success_rate) ?
        stats.success_rate
      : 0
    successRatePercent = Math.round(Math.min(100, Math.max(0, rateRaw)))
    successfulCount = Math.round(totalTests * (successRatePercent / 100))
    failedCount = Math.max(0, totalTests - successfulCount)

    const recent = Array.isArray(device.recent_tests) ? device.recent_tests : []
    const summary = summarizeFirstRecentTest(recent[0])

    lastTestLine = summary
  }

  const approvalRaw = metaStr(m, 'approval_status')
  const sidebarGroup = approvalRaw ? humanizeMetaLabel(approvalRaw) : undefined

  const sidebarTags: string[] = []
  const tierTag = metaStr(m, 'tier')
  const groupTag = metaStr(m, 'group')
  if (tierTag) sidebarTags.push(humanizeMetaLabel(tierTag))
  if (groupTag) sidebarTags.push(humanizeMetaLabel(groupTag))
  if (approvalRaw) {
    const approvalLabel = humanizeMetaLabel(approvalRaw)
    if (!sidebarTags.includes(approvalLabel)) sidebarTags.push(approvalLabel)
  }

  return {
    hardwareSubtitle,
    androidDisplay,
    appVersion,
    signalDbm: signalDbm !== undefined ? signalDbm : undefined,
    storageAvailableMb,
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
