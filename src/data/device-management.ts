export type DeviceManagementStatus = 'Online' | 'Offline' | 'Warning' | 'Low Battery'

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
  tags: string
  lowBatteryPercent: number
  offlineMinutes: number
}

/** Device detail screen (Figma 708:23140) — mock view model until API exists. */
export type DeviceDetailView = {
  subtitle: string
  hardware: {
    model: string
    android: string
    appVersion: string
  }
  health: {
    batteryPercent: number
    batteryCaption: string
    storagePercent: number
    storageCaption: string
    memoryPercent: number
    memoryCaption: string
    signalCaption: string
  }
  network: {
    operator: string
    networkTypeLabel: string
    msisdnDisplay: string
  }
  location: {
    coordinates: string
    address: string
    mapEmbedUrl: string
  }
  tests24h: {
    total: number
    successRatePercent: number
    successful: number
    failed: number
    lastTestLine: string
  }
  sidebar: {
    group: string
    tags: string[]
  }
}

const NIGERIAN_OPERATORS = ['MTN Nigeria', 'Airtel Nigeria', 'Glo Mobile', '9mobile'] as const

function hashPick<T>(id: string, salt: number, arr: readonly T[]): T {
  let h = salt
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  }
  return arr[h % arr.length]
}

function humanizeBadgeSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function deviceDetailSubtitle(device: DeviceRecord): string {
  if (device.deviceType === 'Probe Mobile') return 'Samsung Galaxy A52'
  if (device.deviceType === 'Edge Gateway') return 'VeSS Edge Gateway'
  return device.deviceType
}

function androidVersionLabel(device: DeviceRecord): string {
  return hashPick(device.id, 11, ['11 (API 30)', '12 (API 31)', '13 (API 33)', '14 (API 34)'] as const)
}

function appVersionLabel(device: DeviceRecord): string {
  let h = 0
  for (let i = 0; i < device.id.length; i += 1) h = (h * 13 + device.id.charCodeAt(i)) % 10
  return `1.${1 + (h % 3)}.${h}`
}

function networkTypeDetailLabel(device: DeviceRecord): string {
  if (device.status === 'Offline') return '—'
  if (device.networkType === '5G') return '5G NR'
  if (device.networkType === '4G') return '4G LTE'
  if (device.networkType === '3G') return '3G UMTS'
  return `${device.networkType} LTE`
}

function msisdnDisplayLabel(device: DeviceRecord): string {
  let h = 0
  for (let i = 0; i < device.id.length; i += 1) {
    h = (h * 13 + device.id.charCodeAt(i)) >>> 0
  }
  const national = String(1_000_000_000 + (h % 900_000_000)).slice(-10)
  return `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 10)}`
}

function storageMemoryDetail(device: DeviceRecord): {
  storagePct: number
  memoryPct: number
  storageCaption: string
  memoryCaption: string
} {
  let h = 0
  for (let i = 0; i < device.id.length; i += 1) h = (h + device.id.charCodeAt(i)) >>> 0
  const storagePct = 30 + (h % 50)
  const memoryPct = 35 + ((h >> 3) % 45)
  const freeGb = 20 + (h % 45)
  const freeMem = 1 + ((h >> 5) % 14) * 0.5
  return {
    storagePct,
    memoryPct,
    storageCaption: `${storagePct}% (${freeGb}GB free)`,
    memoryCaption: `${memoryPct}% (${freeMem.toFixed(1)}GB free)`,
  }
}

function batteryStatusCaption(device: DeviceRecord): string {
  const p = device.batteryPercent
  if (device.status === 'Offline') return `${p}% (Offline)`
  if (p >= 95) return `${p}% (Full)`
  if (device.status === 'Online' && p < 95) return `${p}% (Charging)`
  if (device.status === 'Low Battery' || device.status === 'Warning') return `${p}% (Low)`
  return `${p}%`
}

function signalDetailCaption(device: DeviceRecord): string {
  if (device.status === 'Offline') return '—'
  let h = 0
  for (let i = 0; i < device.id.length; i += 1) {
    h = (h * 17 + device.id.charCodeAt(i)) % 40
  }
  const dbm = -(65 + h)
  const quality = dbm > -70 ? 'Good' : dbm > -85 ? 'Fair' : 'Weak'
  return `${dbm} dBm (${quality})`
}

function tests24hDetail(device: DeviceRecord): DeviceDetailView['tests24h'] {
  let h = 0
  for (let i = 0; i < device.id.length; i += 1) h = (h * 31 + device.id.charCodeAt(i)) >>> 0
  const total = 20 + (h % 40)
  const failed = h % 5 === 0 ? 2 : h % 5 === 1 ? 1 : 0
  const successful = Math.max(0, total - failed)
  const successRatePercent = total === 0 ? 0 : Math.round((successful / total) * 100)
  const lastOk = failed === 0
  const lastTestLine = lastOk
    ? '2 minutes ago (Call Test - Success)'
    : '2 minutes ago (Call Test - Failed)'
  return {
    total,
    successRatePercent,
    successful,
    failed,
    lastTestLine,
  }
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

export function buildDeviceDetailView(device: DeviceRecord): DeviceDetailView {
  const sm = storageMemoryDetail(device)
  const tests = tests24hDetail(device)
  const model = deviceDetailSubtitle(device)
  const { latitude: lat, longitude: lon } = vessDemoMapCenter

  return {
    subtitle: model,
    hardware: {
      model,
      android: androidVersionLabel(device),
      appVersion: appVersionLabel(device),
    },
    health: {
      batteryPercent: device.batteryPercent,
      batteryCaption: batteryStatusCaption(device),
      storagePercent: sm.storagePct,
      storageCaption: sm.storageCaption,
      memoryPercent: sm.memoryPct,
      memoryCaption: sm.memoryCaption,
      signalCaption: signalDetailCaption(device),
    },
    network: {
      operator: hashPick(device.id, 3, NIGERIAN_OPERATORS),
      networkTypeLabel: networkTypeDetailLabel(device),
      msisdnDisplay: msisdnDisplayLabel(device),
    },
    location: {
      coordinates: '6.5244° N, 3.3792° E',
      address: `${device.location}, Nigeria`,
      mapEmbedUrl: buildDeviceMapEmbedUrl(lat, lon),
    },
    tests24h: tests,
    sidebar: {
      group: 'Production',
      tags: [humanizeBadgeSlug(device.badgePrimary), device.badgeSecondary ?? 'tier-1', 'priority'],
    },
  }
}

export const deviceRecords: DeviceRecord[] = [
  {
    id: 'dev-1',
    name: 'PortHarcourt-Central-01',
    badgePrimary: 'port-harcourt',
    badgeSecondary: 'tier-1',
    location: 'Port Harcourt',
    deviceType: 'Edge Gateway',
    networkType: '4G',
    lastSeen: '14 minutes ago',
    status: 'Online',
    batteryPercent: 87,
  },
  {
    id: 'dev-2',
    name: 'Abuja-Central-02',
    badgePrimary: 'abuja',
    badgeSecondary: 'tier-1',
    location: 'Abuja',
    deviceType: 'Probe Mobile',
    networkType: '4G',
    lastSeen: '5 minutes ago',
    status: 'Online',
    batteryPercent: 92,
  },
  {
    id: 'dev-3',
    name: 'Kano-Central-04',
    badgePrimary: 'kano',
    badgeSecondary: 'tier-2',
    location: 'Kano',
    deviceType: 'Edge Gateway',
    networkType: '5G',
    lastSeen: '12 minutes ago',
    status: 'Warning',
    batteryPercent: 12,
  },
  {
    id: 'dev-4',
    name: 'Port-Harcourt-02',
    badgePrimary: 'port-harcourt',
    badgeSecondary: 'tier-1',
    location: 'Port Harcourt',
    deviceType: 'Probe Mobile',
    networkType: '3G',
    lastSeen: '1 hour ago',
    status: 'Offline',
    batteryPercent: 0,
  },
  {
    id: 'dev-5',
    name: 'Lagos-West-03',
    badgePrimary: 'ikeja',
    badgeSecondary: 'tier-1',
    location: 'Ikeja',
    deviceType: 'Edge Gateway',
    networkType: '5G',
    lastSeen: '3 minutes ago',
    status: 'Online',
    batteryPercent: 74,
  },
  {
    id: 'dev-6',
    name: 'Enugu-West-06',
    badgePrimary: 'enugu',
    badgeSecondary: 'tier-2',
    location: 'Enugu',
    deviceType: 'Probe Mobile',
    networkType: '4G',
    lastSeen: '8 minutes ago',
    status: 'Low Battery',
    batteryPercent: 18,
  },
]

/** KPI counts derived from `deviceRecords` so hub numbers match the grid/table. */
export const deviceKpiSummary = {
  total: deviceRecords.length,
  online: deviceRecords.filter((d) => d.status === 'Online').length,
  offline: deviceRecords.filter((d) => d.status === 'Offline').length,
  lowBattery: deviceRecords.filter((d) => d.status === 'Low Battery').length,
} as const

export const registerDeviceDetectedLocation = {
  headline: 'Detected location',
  city: 'Lagos',
  coordinates: '6.5244°N, 3.3792°E',
} as const

export const registerDeviceGroupOptions = [
  { value: '', label: 'Select group' },
  { value: 'production', label: 'Production' },
  { value: 'tier-1', label: 'Tier 1' },
  { value: 'tier-2', label: 'Tier 2' },
  { value: 'priority', label: 'Priority' },
] as const

export function resolveDeviceRecord(deviceId: string): DeviceRecord | undefined {
  return deviceRecords.find((d) => d.id === deviceId)
}

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

/** Map Device Management ids to `remoteDevices` records for deep-linking remote control. */
const managementDeviceToRemoteDeviceId: Record<string, string> = {
  'dev-1': 'rd-1',
  'dev-2': 'rd-2',
  'dev-3': 'rd-3',
  'dev-4': 'rd-1',
  'dev-5': 'rd-4',
  'dev-6': 'rd-2',
}

/**
 * Resolves a URL/state `deviceId` to a remote control list id (`rd-*`).
 * Accepts either a management id (`dev-*`) or an existing remote id.
 */
export function resolveRemoteDeviceHighlightId(deviceId: string | null | undefined): string | undefined {
  if (!deviceId) return undefined
  if (deviceId.startsWith('rd-')) return deviceId
  return managementDeviceToRemoteDeviceId[deviceId]
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

export function deviceTestHistoryFor(deviceId: string): DeviceTestHistoryRow[] {
  const base: DeviceTestHistoryRow[] = [
    {
      id: 'th-1',
      kind: 'Call',
      targetMsisdn: '+234 801 234 5678',
      detailLine: 'Test SMS message',
      durationSeconds: 15,
      dateDisplay: '25/03/2026',
      timeDisplay: '11:21:56',
      additionalInfo: 'Latency: 850ms',
      outcome: 'Success',
    },
    {
      id: 'th-2',
      kind: 'SMS',
      targetMsisdn: '+234 802 345 6789',
      detailLine: 'Inquiry about services',
      durationSeconds: 20,
      dateDisplay: '16/03/2026',
      timeDisplay: '12:15:22',
      additionalInfo: 'Latency: 720ms',
      outcome: 'Success',
    },
    {
      id: 'th-3',
      kind: 'Call',
      targetMsisdn: '+234 801 234 5678',
      detailLine: 'Call dropped after 3 seconds',
      durationSeconds: 2,
      dateDisplay: '25/03/2026',
      timeDisplay: '11:21:56',
      additionalInfo: '---',
      outcome: 'Failed',
    },
    {
      id: 'th-4',
      kind: 'USSD',
      targetMsisdn: '+234 801 234 5678',
      detailLine: 'Test SMS message',
      durationSeconds: 5,
      dateDisplay: '25/03/2026',
      timeDisplay: '11:21:56',
      additionalInfo: 'Latency: 850ms',
      outcome: 'Success',
    },
    {
      id: 'th-5',
      kind: 'Call',
      targetMsisdn: '+234 801 234 5678',
      detailLine: 'Registration check',
      durationSeconds: 12,
      dateDisplay: '13/03/2026',
      timeDisplay: '16:30:21',
      additionalInfo: '---',
      outcome: 'Success',
    },
    {
      id: 'th-6',
      kind: 'SMS',
      targetMsisdn: '+234 808 444 5566',
      detailLine: 'Delivery receipt',
      durationSeconds: 18,
      dateDisplay: '13/03/2026',
      timeDisplay: '10:12:55',
      additionalInfo: 'Latency: 910ms',
      outcome: 'Success',
    },
    {
      id: 'th-7',
      kind: 'USSD',
      targetMsisdn: '*131#',
      detailLine: 'Data bundle menu',
      durationSeconds: 11,
      dateDisplay: '12/03/2026',
      timeDisplay: '09:01:02',
      additionalInfo: '---',
      outcome: 'Success',
    },
    {
      id: 'th-8',
      kind: 'Call',
      targetMsisdn: '+234 803 222 3344',
      detailLine: 'Echo test',
      durationSeconds: 22,
      dateDisplay: '12/03/2026',
      timeDisplay: '07:45:18',
      additionalInfo: 'Latency: 680ms',
      outcome: 'Success',
    },
    {
      id: 'th-9',
      kind: 'SMS',
      targetMsisdn: '+234 801 234 5678',
      detailLine: 'Concat SMS',
      durationSeconds: 25,
      dateDisplay: '11/03/2026',
      timeDisplay: '13:40:09',
      additionalInfo: '---',
      outcome: 'Success',
    },
    {
      id: 'th-10',
      kind: 'Call',
      targetMsisdn: '+234 807 777 8899',
      detailLine: 'Handover probe',
      durationSeconds: 30,
      dateDisplay: '11/03/2026',
      timeDisplay: '18:22:33',
      additionalInfo: '---',
      outcome: 'Success',
    },
  ]
  return base.map((row) => ({ ...row, id: `${deviceId}-${row.id}` }))
}

/** Figma 708:24666 — demo ledger (15 rows, 1 error / 2 warnings). */
function deviceLogsBase(): Omit<DeviceLogEntry, 'id'>[] {
  return [
    {
      level: 'INFO',
      category: 'System',
      message: 'Device heartbeat sent successfully',
      timestamp: '11:23:55',
    },
    {
      level: 'INFO',
      category: 'Test',
      message: 'Call test completed: +234 801 234 5678 - Duration: 15.3s',
      timestamp: '11:23:51',
    },
    {
      level: 'DEBUG',
      category: 'Network',
      message: 'Network type changed: 4G LTE',
      timestamp: '11:23:55',
    },
    {
      level: 'WARNING',
      category: 'Storage',
      message: 'Storage usage at 42% - 23GB free',
      timestamp: '11:23:55',
    },
    {
      level: 'INFO',
      category: 'System',
      message: 'Device heartbeat sent successfully',
      timestamp: '11:23:55',
    },
    {
      level: 'ERROR',
      category: 'Test',
      message: 'Call test failed: Connection dropped after 3 seconds',
      timestamp: '11:23:55',
    },
    {
      level: 'DEBUG',
      category: 'Location',
      message: 'Network type changed: 4G LTE',
      timestamp: '11:23:55',
    },
    {
      level: 'WARNING',
      category: 'Storage',
      message: 'Storage usage at 42% - 23GB free',
      timestamp: '11:23:55',
    },
    {
      level: 'INFO',
      category: 'System',
      message: 'Device heartbeat sent successfully',
      timestamp: '11:23:55',
    },
    {
      level: 'DEBUG',
      category: 'Network',
      message: 'Network type changed: 4G LTE',
      timestamp: '11:23:54',
    },
    {
      level: 'INFO',
      category: 'Test',
      message: 'SMS delivery confirmed for MSISDN +234 802 345 6789',
      timestamp: '11:23:50',
    },
    {
      level: 'INFO',
      category: 'System',
      message: 'Configuration sync completed',
      timestamp: '11:23:48',
    },
    {
      level: 'INFO',
      category: 'System',
      message: 'Device heartbeat sent successfully',
      timestamp: '11:23:45',
    },
    {
      level: 'DEBUG',
      category: 'Network',
      message: 'RSSI -68 dBm · cell 12094',
      timestamp: '11:23:42',
    },
    {
      level: 'INFO',
      category: 'System',
      message: 'Device heartbeat sent successfully',
      timestamp: '11:23:40',
    },
  ]
}

export function deviceLogsFor(deviceId: string): DeviceLogEntry[] {
  return deviceLogsBase().map((row, index) => ({
    ...row,
    id: `${deviceId}-log-${index + 1}`,
  }))
}

function deviceEditThresholdDefaults(deviceId: string): Pick<
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

/** Location summary card on Edit Device Configuration (Figma 708:25447). */
export function deviceEditDetectedLocation(device: DeviceRecord): {
  headline: string
  city: string
  coordinates: string
} {
  const detail = buildDeviceDetailView(device)
  return {
    headline: 'Current location',
    city: device.location,
    coordinates: detail.location.coordinates,
  }
}

export function deviceEditDefaults(deviceId: string): DeviceEditDefaults {
  const d = resolveDeviceRecord(deviceId)
  if (!d) {
    return {
      name: '',
      locationMode: 'detected',
      locationManual: '',
      deviceGroup: '',
      msisdn: '',
      tags: '',
      lowBatteryPercent: 15,
      offlineMinutes: 10,
    }
  }
  const detail = buildDeviceDetailView(d)
  const thresholds = deviceEditThresholdDefaults(deviceId)
  const groupRaw = detail.sidebar.group.trim().toLowerCase().replace(/\s+/g, '-')
  const allowedGroupSlugs = new Set<string>(
    registerDeviceGroupOptions.map((o) => o.value).filter((v) => v !== ''),
  )
  return {
    name: d.name,
    locationMode: 'detected',
    locationManual: d.location,
    deviceGroup: allowedGroupSlugs.has(groupRaw) ? groupRaw : '',
    msisdn: detail.network.msisdnDisplay.replace(/\s/g, ''),
    tags: detail.sidebar.tags.join(', '),
    lowBatteryPercent: thresholds.lowBatteryPercent,
    offlineMinutes: thresholds.offlineMinutes,
  }
}
