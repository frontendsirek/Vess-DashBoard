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
import {
  batteryLevelFromDevice,
  deviceGroupLabelFromDevice,
  deviceTagsFromDevice,
  hardwareFromDevice,
  lowBatteryThresholdFromDevice,
  mapDeviceStatusWithBatteryThreshold,
  msisdnRawFromDevice,
  networkOperatorFromDevice,
  networkTypeFromDevice,
  signalStrengthFromDevice,
  testSummaryFromDevice,
  usagePercentFromAvailableUsed,
} from '@/lib/api-device-detail-accessors'
import { formatPhoneMsisdnDisplay } from '@/lib/api-device-mapper'
import type { ApiDeviceDetail } from '@/types/device'

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
  return batteryLevelFromDevice(api)
}

export function managementStatusFromApiDetail(
  api: ApiDeviceDetail,
  batteryPct: number | null,
): DeviceManagementStatus {
  return mapDeviceStatusWithBatteryThreshold(
    api.status,
    batteryPct,
    lowBatteryThresholdFromDevice(api),
  )
}

function formatOsDisplay(hardware: ReturnType<typeof hardwareFromDevice>): string {
  const os = hardware.os?.trim()
  const version = hardware.os_version?.trim()
  if (os && version) return `${os} ${version}`
  if (version) return `Android ${version}`
  if (os) return os
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
  const bp = batteryPercentFromApiDetail(api)
  const hardware = hardwareFromDevice(api)

  const manufacturer = hardware.manufacturer?.trim()
  const modelSlug = hardware.model?.trim()
  const headlineModelLine =
    manufacturer && modelSlug ?
      `${titleWord(manufacturer)} ${modelSlug}`
    : modelSlug ??
      (manufacturer ? titleWord(manufacturer) : MISSING_API_FIELD_DISPLAY)

  const storage = api.health_metrics?.storage
  const storageAvailable =
    typeof storage?.available_mb === 'number' && Number.isFinite(storage.available_mb) ?
      storage.available_mb
    : null
  const storageUsed =
    typeof storage?.used_mb === 'number' && Number.isFinite(storage.used_mb) ?
      storage.used_mb
    : null
  const storageCaption =
    storageAvailable != null ? `${storageAvailable} MB free` : MISSING_API_FIELD_DISPLAY
  const storagePercent =
    storageAvailable != null && storageUsed != null ?
      usagePercentFromAvailableUsed(storageAvailable, storageUsed)
    : 0

  const memory = api.health_metrics?.memory
  const memoryAvailable =
    typeof memory?.available_mb === 'number' && Number.isFinite(memory.available_mb) ?
      memory.available_mb
    : null
  const memoryUsed =
    typeof memory?.used_mb === 'number' && Number.isFinite(memory.used_mb) ?
      memory.used_mb
    : null
  const memoryCaption =
    memoryAvailable != null ? `${memoryAvailable} MB free` : MISSING_API_FIELD_DISPLAY
  const memoryPercent =
    memoryAvailable != null && memoryUsed != null ?
      usagePercentFromAvailableUsed(memoryAvailable, memoryUsed)
    : 0

  const sig = signalStrengthFromDevice(api)
  const signalCaption =
    sig != null ? `${sig} dBm` : MISSING_API_FIELD_DISPLAY

  const operatorReadable = networkOperatorFromDevice(api)
  const netType = networkTypeFromDevice(api)
  const netTypeMeta = netType ?? MISSING_API_FIELD_DISPLAY

  const msisdnBlock = (() => {
    const compact = msisdnRawFromDevice(api)
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

  const physicalAddress = api.physical_address?.trim()
  const locationCity = api.location?.trim()
  let locationAddress = MISSING_API_FIELD_DISPLAY
  if (physicalAddress && physicalAddress.length > 0) locationAddress = physicalAddress
  else if (locationCity && locationCity.length > 0) locationAddress = locationCity

  const summary = testSummaryFromDevice(api)
  let tests24hTotal = MISSING_API_FIELD_DISPLAY
  let tests24hSuccessRate = MISSING_API_FIELD_DISPLAY
  let testsSuccessful = MISSING_API_FIELD_DISPLAY
  let testsFailed = MISSING_API_FIELD_DISPLAY
  let testsLastRead = MISSING_API_FIELD_DISPLAY

  if (summary && typeof summary.total_tests === 'number' && Number.isFinite(summary.total_tests)) {
    const total = Math.max(0, Math.floor(summary.total_tests))
    const successful = Math.max(0, Math.floor(summary.successful_tests ?? 0))
    const failed = Math.max(0, Math.floor(summary.failed_tests ?? 0))
    const rateRaw =
      typeof summary.success_rate === 'number' && Number.isFinite(summary.success_rate) ?
        summary.success_rate
      : total > 0 ?
        (successful / total) * 100
      : 0
    const sr = Math.round(Math.min(100, Math.max(0, rateRaw)))

    tests24hTotal = String(total)
    tests24hSuccessRate = `${sr}%`
    testsSuccessful = String(successful)
    testsFailed = String(failed)

    if (summary.avg_network_speed_mbps != null && Number.isFinite(summary.avg_network_speed_mbps)) {
      testsLastRead = `Avg speed: ${summary.avg_network_speed_mbps.toFixed(1)} Mbps`
    }
  }

  const groupRaw = deviceGroupLabelFromDevice(api)
  const sidebarGroupReadable =
    groupRaw ? humanTagLabel(groupRaw) : MISSING_API_FIELD_DISPLAY

  const tagPool = deviceTagsFromDevice(api).map((tag) => humanTagLabel(tag))

  const modelDisplay = modelSlug && modelSlug.length > 0 ? modelSlug : headlineModelLine

  return {
    routeDeviceId: api.device_id,
    displayName: readableString(api.device_name),
    subtitle: headlineModelLine,
    headlineModelLine,
    lastSeen: formatLastSeenFromIso(api.last_heartbeat),
    managementStatus: managementStatusFromApiDetail(api, bp),
    hardware: {
      model: modelDisplay,
      android: formatOsDisplay(hardware),
      appVersion: readableString(hardware.app_version),
    },
    health: {
      batteryCaption: bp === null ? MISSING_API_FIELD_DISPLAY : `${bp}%`,
      batteryPercent: bp ?? 0,
      storageCaption,
      storagePercent,
      memoryCaption,
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
