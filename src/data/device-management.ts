export type DeviceManagementStatus = 'Online' | 'Offline' | 'Warning' | 'Low Battery'

/** Detail-only fields sourced from GET device API (`mapApiDeviceToDeviceDetailRecord`). */
export type DeviceApiDetailOverlay = {
  hardwareSubtitle?: string
  androidDisplay?: string
  appVersion?: string
  signalDbm?: number
  storageAvailableMb?: number
  /** When backend sends carrier / operator in metadata */
  networkOperator?: string
  msisdnDisplay?: string
  totalTests?: number
  successRatePercent?: number
  successfulCount?: number
  failedCount?: number
  lastTestLine?: string
  sidebarGroup?: string
  /** Replaces heuristic tags when API provides tag labels */
  sidebarTags?: readonly string[]
}

export type DeviceRecord = {
  id: string
  name: string
  badgePrimary: string
  badgeSecondary?: string
  location: string
  deviceType: string
  networkType: string
  lastSeen: string
  status: DeviceManagementStatus
  batteryPercent: number
  /** Present when sourced from device-service API — drives map + coordinates on detail */
  latitude?: number
  longitude?: number
  /** Present only for `/device-management/:id` loaded via API — renders strict API-only fields */
  apiDetailOverlay?: DeviceApiDetailOverlay
}

export type DeviceTestHistoryOutcome = 'Success' | 'Failed' | 'Running'

export type DeviceTestHistoryKind = 'Call' | 'SMS' | 'USSD'

export function deviceTestHistoryKindLabel(kind: DeviceTestHistoryKind): string {
  if (kind === 'SMS') return 'SMS Test'
  if (kind === 'USSD') return 'USSD Test'
  return 'Call Test'
}

/** Device test history table (Figma 708:24003). */
export type DeviceTestHistoryRow = {
  id: string
  kind: DeviceTestHistoryKind
  /** e.g. "+234 801 234 5678" */
  targetMsisdn: string
  detailLine: string
  durationSeconds: number
  dateDisplay: string
  timeDisplay: string
  /** e.g. "Latency: 850ms" or "---" */
  additionalInfo: string
  outcome: DeviceTestHistoryOutcome
}

export type DeviceLogLevel = 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR'

/** Figma 708:24666 device logs row. */
export type DeviceLogEntry = {
  id: string
  level: DeviceLogLevel
  /** e.g. System, Test, Network — sentence case in UI */
  category: string
  message: string
  /** Display time e.g. 11:23:55 */
  timestamp: string
}

export type DeviceEditDefaults = {
  name: string
  locationMode: 'detected' | 'manual'
  /** Pre-filled when user switches to manual entry (seeded from device site name). */
  locationManual: string
  deviceGroup: string
  /** Compact E.164 digits suitable for `VessPhoneInput` `value`. */
  msisdn: string
  imei: string
  tags: string
  lowBatteryPercent: number
  offlineMinutes: number
}

/** Demo map center (Lagos — Figma device detail & dashboard live network). */
export const vessDemoMapCenter = {
  latitude: 6.5244,
  longitude: 3.3792,
} as const

/** OpenStreetMap embed (Lagos demo coordinates), matches Figma map block. */
export function buildDeviceMapEmbedUrl(latitude: number, longitude: number): string {
  const pad = 0.035
  const minLon = longitude - pad
  const minLat = latitude - pad
  const maxLon = longitude + pad
  const maxLat = latitude + pad
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

/** Human-readable coordinates for detail header (matches demo style). */
export function formatDeviceCoordinatesDisplay(latitude: number, longitude: number): string {
  const latHem = latitude >= 0 ? 'N' : 'S'
  const lonHem = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(4)}° ${latHem}, ${Math.abs(longitude).toFixed(4)}° ${lonHem}`
}



export const registerDeviceGroupOptions = [
  { value: '', label: 'Select group' },
  { value: 'production', label: 'Production' },
  { value: 'tier-1', label: 'Tier 1' },
  { value: 'tier-2', label: 'Tier 2' },
  { value: 'priority', label: 'Priority' },
] as const

/** Network column: offline devices show em-dash per Figma. */
export function formatDeviceNetworkDisplay(device: DeviceRecord): string {
  if (device.status === 'Offline') return '---'
  return device.networkType
}

/** Table battery column: emphasize low charge (Figma: red % + “Low” pill). */
export function deviceShowsLowBatteryTag(device: DeviceRecord): boolean {
  if (device.batteryPercent <= 0) return false
  return device.batteryPercent <= 20 || device.status === 'Low Battery'
}

export function deviceTestHistorySummary(rows: DeviceTestHistoryRow[]): {
  total: number
  successful: number
  failed: number
  avgMbps: number
} {
  const total = rows.length
  const successful = rows.filter((r) => r.outcome === 'Success').length
  const failed = rows.filter((r) => r.outcome === 'Failed').length
  return { total, successful, failed, avgMbps: 50 }
}

/** KPI strip on device test history when detail API exposes `test_summary` only. */
export function deviceTestHistorySummaryFromApiSummary(
  summary:
    | {
        total_tests?: number
        successful_tests?: number
        failed_tests?: number
        avg_network_speed_mbps?: number | null
      }
    | null
    | undefined,
): {
  total: number
  successful: number
  failed: number
  avgMbps: number
} {
  if (!summary || typeof summary.total_tests !== 'number') {
    return { total: 0, successful: 0, failed: 0, avgMbps: 0 }
  }

  const total = Math.max(0, Math.floor(summary.total_tests))
  const successful = Math.max(0, Math.floor(summary.successful_tests ?? 0))
  const failed = Math.max(0, Math.floor(summary.failed_tests ?? 0))
  const avgRaw = summary.avg_network_speed_mbps
  const avgMbps =
    avgRaw != null && Number.isFinite(avgRaw) ? Math.round(avgRaw * 10) / 10 : 0

  return { total, successful, failed, avgMbps }
}

export function deviceEditThresholdDefaults(deviceId: string): Pick<
  DeviceEditDefaults,
  'lowBatteryPercent' | 'offlineMinutes'
> {
  let h = 0
  for (let i = 0; i < deviceId.length; i += 1) h = (h * 31 + deviceId.charCodeAt(i)) >>> 0
  return {
    lowBatteryPercent: 10 + (h % 16),
    offlineMinutes: 5 + (h % 16),
  }
}
