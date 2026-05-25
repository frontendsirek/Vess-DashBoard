import type {
  ApiDevice,
  ApiDeviceDetail,
  ApiDeviceHardware,
  ApiDeviceTestSummary,
  DeviceStatus,
} from '@/types/device'

export function isApiDeviceDetail(device: ApiDevice | ApiDeviceDetail): device is ApiDeviceDetail {
  return 'health_metrics' in device || 'hardware' in device || 'test_summary' in device
}

export function usagePercentFromAvailableUsed(availableMb: number, usedMb: number): number {
  const total = availableMb + usedMb
  if (!Number.isFinite(total) || total <= 0) return 0
  return Math.round(Math.min(100, Math.max(0, (usedMb / total) * 100)))
}

export function batteryLevelFromDevice(device: ApiDevice | ApiDeviceDetail): number | null {
  if (isApiDeviceDetail(device)) {
    const level = device.health_metrics?.battery?.level
    if (typeof level === 'number' && Number.isFinite(level)) {
      return Math.min(100, Math.max(0, Math.round(level)))
    }
    return null
  }

  const raw = device.metadata?.battery_level ?? device.metadata?.battery_percent
  if (raw === undefined || raw === null || raw === '') return null
  const parsed =
    typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : null
}

export function lowBatteryThresholdFromDevice(device: ApiDevice | ApiDeviceDetail): number {
  if (isApiDeviceDetail(device)) {
    const threshold = device.alert_thresholds?.battery_threshold
    if (typeof threshold === 'number' && Number.isFinite(threshold)) {
      return Math.min(100, Math.max(1, Math.round(threshold)))
    }
  }
  return 20
}

export function hardwareFromDevice(device: ApiDevice | ApiDeviceDetail): ApiDeviceHardware {
  if (isApiDeviceDetail(device)) return device.hardware ?? {}
  const meta = device.metadata ?? {}
  return {
    manufacturer: typeof meta.manufacturer === 'string' ? meta.manufacturer : undefined,
    model: typeof meta.model === 'string' ? meta.model : undefined,
    os: 'Android',
    os_version:
      typeof meta.android_version === 'string' ? meta.android_version : undefined,
    app_version:
      typeof meta.app_version === 'string' ?
        meta.app_version
      : device.health?.app_version !== undefined ?
        String(device.health.app_version)
      : undefined,
  }
}

export function networkTypeFromDevice(device: ApiDevice | ApiDeviceDetail): string | undefined {
  if (isApiDeviceDetail(device)) {
    const type = device.network?.type?.trim()
    return type && type.length > 0 ? type : undefined
  }
  const meta = device.metadata ?? {}
  const raw =
    typeof meta.network_type === 'string' ? meta.network_type
    : typeof meta.network === 'string' ? meta.network
    : undefined
  return raw?.trim() || undefined
}

export function signalStrengthFromDevice(device: ApiDevice | ApiDeviceDetail): number | null {
  if (isApiDeviceDetail(device)) {
    const signal = device.network?.signal_strength
    return typeof signal === 'number' && Number.isFinite(signal) ? signal : null
  }
  const raw = device.metadata?.signal_strength
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

export function msisdnRawFromDevice(device: ApiDevice | ApiDeviceDetail): string | undefined {
  if (isApiDeviceDetail(device)) {
    const raw = device.msisdn?.trim() || device.network?.msisdn?.trim()
    return raw && raw.length > 0 ? raw : undefined
  }
  const raw = device.metadata?.phone_number
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : undefined
}

export function networkOperatorFromDevice(device: ApiDevice | ApiDeviceDetail): string | undefined {
  if (isApiDeviceDetail(device)) {
    const raw = device.network?.operator?.trim()
    return raw && raw.length > 0 ? raw : undefined
  }
  const meta = device.metadata ?? {}
  const raw =
    typeof meta.network_operator === 'string' ? meta.network_operator
    : typeof meta.carrier === 'string' ? meta.carrier
    : typeof meta.sim_operator === 'string' ? meta.sim_operator
    : undefined
  return raw?.trim() || undefined
}

export function testSummaryFromDevice(
  device: ApiDevice | ApiDeviceDetail,
): ApiDeviceTestSummary | null {
  if (isApiDeviceDetail(device)) return device.test_summary ?? null
  const stats = device.statistics
  if (!stats || typeof stats.total_tests !== 'number') return null
  const rate =
    typeof stats.success_rate === 'number' && Number.isFinite(stats.success_rate) ?
      stats.success_rate
    : 0
  const total = Math.max(0, Math.floor(stats.total_tests))
  const successful = Math.round(total * (Math.min(100, Math.max(0, rate)) / 100))
  return {
    total_tests: total,
    successful_tests: successful,
    failed_tests: Math.max(0, total - successful),
    avg_network_speed_mbps: null,
    success_rate: rate,
  }
}

export function deviceGroupLabelFromDevice(device: ApiDeviceDetail): string | undefined {
  const raw = device.device_group?.trim()
  return raw && raw.length > 0 ? raw : undefined
}

export function deviceTagsFromDevice(device: ApiDeviceDetail): string[] {
  return Array.isArray(device.tags) ?
      device.tags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
    : []
}

export function mapDeviceStatusWithBatteryThreshold(
  status: DeviceStatus,
  batteryPercent: number | null,
  lowBatteryThreshold: number,
): 'Offline' | 'Low Battery' | 'Warning' | 'Online' {
  if (status === 'OFFLINE') return 'Offline'
  if (
    batteryPercent != null &&
    batteryPercent > 0 &&
    batteryPercent <= lowBatteryThreshold
  ) {
    return 'Low Battery'
  }
  if (status === 'STALE' || status === 'DEGRADED') return 'Warning'
  return 'Online'
}
