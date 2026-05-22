/**
 * View-model for `/device-management/:deviceId` — derives display strings from GET device JSON only.
 * Missing scalars show `-` (ASCII) for defect reports.
 */

import { formatDistanceToNow } from 'date-fns'
import {
  buildDeviceMapEmbedUrl,
  formatDeviceCoordinatesDisplay,
  type DeviceManagementStatus,
} from '@/data/device-management'
import { formatPhoneMsisdnDisplay, metaStr } from '@/lib/api-device-mapper'
import type { ApiDeviceDetail, ApiDeviceDetailMetadata } from '@/types/device'

/** Sentinel for absent or unusable API fields (ASCII hyphen). */
export const MISSING_API_FIELD_DISPLAY = '-'

function titleWord(s: string): string {
  const t = s.trim()
  if (!t.length) return t
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

export function readableString(value: unknown): string {
  if (value === undefined || value === null) return MISSING_API_FIELD_DISPLAY
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number' && Number.isFinite(value)) return `${value}`
  const s = String(value).trim()
  return s.length > 0 ? s : MISSING_API_FIELD_DISPLAY
}

function humanTagLabel(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function summarizeRecentEntry(entry: unknown): string | undefined {
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

function formatLastSeenFromIso(iso: string | null | undefined): string {
  const t = typeof iso === 'string' ? iso.trim() : ''
  if (!t.length) return MISSING_API_FIELD_DISPLAY
  try {
    return formatDistanceToNow(new Date(t), { addSuffix: true })
  } catch {
    return MISSING_API_FIELD_DISPLAY
  }
}

export function batteryPercentFromApiDetail(api: ApiDeviceDetail): number | null {
  const meta = api.metadata
  const raw =
    meta?.battery_level ?? api.health?.battery_level ?? meta?.battery_percent ?? undefined
  if (raw === undefined || raw === null || raw === '') return null
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null
}

export function managementStatusFromApiDetail(
  api: ApiDeviceDetail,
  batteryPct: number | null,
): DeviceManagementStatus {
  if (api.status === 'OFFLINE') return 'Offline'
  if (batteryPct != null && batteryPct > 0 && batteryPct <= 20) return 'Low Battery'
  if (api.status === 'STALE' || api.status === 'DEGRADED') return 'Warning'
  return 'Online'
}

function storageMbFromApi(api: ApiDeviceDetail): number | null {
  const mb =
    api.metadata?.storage_available_mb ?? api.health?.storage_available_mb ?? undefined
  if (typeof mb !== 'number' || !Number.isFinite(mb)) return null
  return mb >= 0 ? mb : null
}

function signalDbm(api: ApiDeviceDetail): number | null {
  const v = api.metadata?.signal_strength
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function memoryCaptionFromMeta(metadata: ApiDeviceDetailMetadata): string {
  const m = typeof metadata.memory_available_mb === 'number' && Number.isFinite(metadata.memory_available_mb) ?
      metadata.memory_available_mb
    : undefined
  if (m !== undefined && m >= 0) return `${m} MB free`
  return MISSING_API_FIELD_DISPLAY
}

export type DeviceManagementDetailPageModel = {
  /** Matches `DeviceRecord.id` / URL segment from list navigation (`device_id` from API). */
  routeDeviceId: string
  displayName: string
  subtitle: string
  headlineModelLine: string
  lastSeen: string
  managementStatus: DeviceManagementStatus
  hardware: { model: string; android: string; appVersion: string }
  health: {
    batteryCaption: string
    batteryPercent: number
    storageCaption: string
    storagePercent: number
    memoryCaption: string
    memoryPercent: number
    signalCaption: string
  }
  network: { operator: string; networkType: string; msisdnDisplay: string }
  location: { coordinates: string; address: string; mapEmbedSrc: string | null }
  tests24h: {
    totalDisplay: string
    successRateDisplay: string
    successfulDisplay: string
    failedDisplay: string
    lastTestDisplay: string
  }
  sidebar: {
    group: string
    tags: string[]
  }
}

export function buildDeviceManagementDetailPageModel(api: ApiDeviceDetail): DeviceManagementDetailPageModel {
  const meta = api.metadata ?? ({} as ApiDeviceDetailMetadata)
  const bp = batteryPercentFromApiDetail(api)

  const manufacturer = metaStr(meta, 'manufacturer')
  const modelSlug = metaStr(meta, 'model')
  const headlineModelLine =
    manufacturer && modelSlug ?
      `${titleWord(manufacturer)} ${modelSlug}`
    : modelSlug ??
      (manufacturer ? titleWord(manufacturer) : MISSING_API_FIELD_DISPLAY)

  let androidDetail = MISSING_API_FIELD_DISPLAY
  const av = metaStr(meta, 'android_version')
  if (av) androidDetail = `Android ${av}`

  const appDetail =
    metaStr(meta, 'app_version')
    ??
    (
      typeof api.health?.app_version === 'string' ?
        api.health.app_version.trim()
      : undefined
    )

  const storageMbVal = storageMbFromApi(api)
  const storageCaption =
    storageMbVal != null ? `${storageMbVal} MB free` : MISSING_API_FIELD_DISPLAY

  const sig = signalDbm(api)
  const signalCaption =
    sig != null ? `${sig} dBm` : MISSING_API_FIELD_DISPLAY

  const operatorReadable =
    metaStr(meta, 'network_operator') ??
    metaStr(meta, 'carrier') ??
    metaStr(meta, 'sim_operator')

  let netTypeMeta = MISSING_API_FIELD_DISPLAY
  const nt = metaStr(meta, 'network_type') ?? metaStr(meta, 'network')
  if (nt) netTypeMeta = nt

  const msisdnBlock = (() => {
    const compact = metaStr(meta, 'phone_number')
    if (!compact) return MISSING_API_FIELD_DISPLAY
    return formatPhoneMsisdnDisplay(compact)
  })()

  const lat = api.latitude
  const lng = api.longitude
  const hasCoords =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)

  let coordinatesReadable = MISSING_API_FIELD_DISPLAY
  let mapEmbed: string | null = null
  if (hasCoords) {
    coordinatesReadable = formatDeviceCoordinatesDisplay(lat, lng)
    mapEmbed = buildDeviceMapEmbedUrl(lat, lng)
  }

  let locationAddress = MISSING_API_FIELD_DISPLAY
  const locTrim = typeof api.location === 'string' ? api.location.trim() : ''
  if (locTrim.length > 0) locationAddress = locTrim

  const stats = api.statistics
  let tests24hTotal = MISSING_API_FIELD_DISPLAY
  let tests24hSuccessRate = MISSING_API_FIELD_DISPLAY
  let testsSuccessful = MISSING_API_FIELD_DISPLAY
  let testsFailed = MISSING_API_FIELD_DISPLAY
  let testsLastRead = MISSING_API_FIELD_DISPLAY

  if (stats && typeof stats.total_tests === 'number' && Number.isFinite(stats.total_tests)) {
    const total = Math.max(0, Math.floor(stats.total_tests))
    const rateRaw =
      typeof stats.success_rate === 'number' && Number.isFinite(stats.success_rate) ?
        stats.success_rate
      : 0
    const sr = Math.round(Math.min(100, Math.max(0, rateRaw)))
    const successful = Math.round(total * (sr / 100))
    const failed = Math.max(0, total - successful)

    tests24hTotal = String(total)
    tests24hSuccessRate = `${sr}%`
    testsSuccessful = String(successful)
    testsFailed = String(failed)

    const recent = Array.isArray(api.recent_tests) ? api.recent_tests : []
    const summaryFirst = summarizeRecentEntry(recent[0])
    testsLastRead = summaryFirst?.trim()?.length ? summaryFirst : MISSING_API_FIELD_DISPLAY
  }

  const approvalSlug = metaStr(meta, 'approval_status')
  const sidebarGroupReadable =
    approvalSlug ? humanTagLabel(approvalSlug) : MISSING_API_FIELD_DISPLAY

  const tagPool: string[] = []
  const tierRead = metaStr(meta, 'tier')
  const groupReadMeta = metaStr(meta, 'group')
  if (tierRead) tagPool.push(humanTagLabel(tierRead))
  if (groupReadMeta) tagPool.push(humanTagLabel(groupReadMeta))
  if (
    approvalSlug &&
    !tagPool.some(
      (entry) => entry.toLowerCase() === humanTagLabel(approvalSlug).toLowerCase(),
    )
  )
    tagPool.push(humanTagLabel(approvalSlug))
  const orgRaw = metaStr(meta, 'organization_id')
  if (
    orgRaw !== undefined &&
    orgRaw.trim().length > 0 &&
    orgRaw.trim().toLowerCase() !== MISSING_API_FIELD_DISPLAY.toLowerCase() &&
    !tagPool.some((tag) => tag.toLowerCase() === orgRaw.toLowerCase())
  )
    tagPool.push(`Organization ${orgRaw}`)

  const memoryCap = memoryCaptionFromMeta(meta)

  let memoryPercent = 0
  const memPctRaw = meta.memory_percent ?? meta.available_memory_percent
  if (typeof memPctRaw === 'number' && Number.isFinite(memPctRaw)) {
    memoryPercent = Math.min(100, Math.max(0, Math.round(memPctRaw)))
  }

  const modelDisplay =
    metaStr(meta, 'model') ??
    headlineModelLine

  return {
    routeDeviceId: api.device_id,
    displayName: readableString(api.device_name),
    subtitle: headlineModelLine,
    headlineModelLine,
    lastSeen: formatLastSeenFromIso(api.last_heartbeat),
    managementStatus: managementStatusFromApiDetail(api, bp),
    hardware: {
      model: modelDisplay,
      android: androidDetail,
      appVersion: readableString(appDetail),
    },
    health: {
      batteryCaption: bp === null ? MISSING_API_FIELD_DISPLAY : `${bp}%`,
      batteryPercent: bp ?? 0,
      storageCaption,
      storagePercent: storageMbVal != null ? 0 : 0,
      memoryCaption: memoryCap,
      memoryPercent,
      signalCaption,
    },
    network: {
      operator: readableString(operatorReadable),
      networkType: netTypeMeta,
      msisdnDisplay: msisdnBlock,
    },
    location: {
      coordinates: coordinatesReadable,
      address: locationAddress,
      mapEmbedSrc: mapEmbed,
    },
    tests24h: {
      totalDisplay: tests24hTotal,
      successRateDisplay: tests24hSuccessRate,
      successfulDisplay: testsSuccessful,
      failedDisplay: testsFailed,
      lastTestDisplay: testsLastRead,
    },
    sidebar: {
      group: sidebarGroupReadable,
      tags: tagPool.length > 0 ? tagPool : [],
    },
  }
}
