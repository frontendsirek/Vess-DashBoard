import {
  batteryLevelFromDevice,
  hardwareFromDevice,
  isApiDeviceDetail,
  msisdnRawFromDevice,
  networkTypeFromDevice,
  signalStrengthFromDevice,
  testSummaryFromDevice,
} from '@/lib/api-device-detail-accessors'
import { formatRelativeLastSeen } from '@/lib/api-device-mapper'
import type { RemoteControlConnectionState, RemoteControlDevice } from '@/types/remote-device-control'
import type { ApiDevice, ApiDeviceDetail, ApiDeviceMetadata, DeviceStatus } from '@/types/device'

type ApiDeviceLike = ApiDevice | ApiDeviceDetail

function titleCaseWord(value: string): string {
  const trimmed = value.trim()
  if (!trimmed.length) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

function parseListBatteryPercent(metadata: ApiDeviceMetadata | undefined): number {
  const raw = metadata?.battery_level ?? metadata?.battery_percent
  if (raw === undefined || raw === null || raw === '') return 0
  const parsed =
    typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0
}

function mapRemoteControlState(
  status: DeviceStatus,
  batteryPercent: number,
): RemoteControlConnectionState {
  if (status === 'OFFLINE') return 'offline'
  if (status === 'STALE' || status === 'DEGRADED') return 'warning'
  if (batteryPercent > 0 && batteryPercent <= 20) return 'warning'
  return 'online'
}

function formatModelLabel(device: ApiDeviceLike): string {
  const hardware = hardwareFromDevice(device)
  const manufacturer = hardware.manufacturer?.trim()
  const model = hardware.model?.trim()
  if (manufacturer && model) return `${titleCaseWord(manufacturer)} ${model}`
  if (model) return model
  if (manufacturer) return titleCaseWord(manufacturer)
  return '—'
}

function formatNetworkLabel(device: ApiDeviceLike): string {
  if (device.status === 'OFFLINE') return 'N/A'
  return networkTypeFromDevice(device) ?? '—'
}

function formatSignalLabel(device: ApiDeviceLike): string {
  if (device.status === 'OFFLINE') return 'N/A'
  const raw = signalStrengthFromDevice(device)
  if (raw != null) return `${raw} dBm`
  return '—'
}

function formatLastTestLabel(device: ApiDeviceLike): string {
  const summary = testSummaryFromDevice(device)
  if (summary?.avg_network_speed_mbps != null && Number.isFinite(summary.avg_network_speed_mbps)) {
    return `Avg speed: ${summary.avg_network_speed_mbps.toFixed(1)} Mbps`
  }

  if (!isApiDeviceDetail(device)) {
    const recent = Array.isArray(device.recent_tests) ? device.recent_tests : []
    const entry = recent[0]
    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>
      const outcome =
        typeof record.outcome === 'string' ? record.outcome
        : typeof record.result === 'string' ? record.result
        : undefined
      const kind =
        typeof record.kind === 'string' ? record.kind
        : typeof record.test_type === 'string' ? record.test_type
        : 'Test'
      const time =
        typeof record.completed_at === 'string' ? record.completed_at
        : typeof record.created_at === 'string' ? record.created_at
        : typeof record.updated_at === 'string' ? record.updated_at
        : undefined
      const parts = [time, kind, outcome ? `(${outcome})` : undefined].filter(Boolean)
      const line = parts.join(' ')
      if (line.length > 0) return line
    }
  }

  return formatRelativeLastSeen(device.last_heartbeat)
}

/** Maps fleet device API payloads into Remote Device Control UI rows. */
export function mapApiDeviceToRemoteControlDevice(device: ApiDeviceLike): RemoteControlDevice {
  const metadata = isApiDeviceDetail(device) ? undefined : (device.metadata ?? {})
  const batteryFromApi = batteryLevelFromDevice(device)
  const battery = batteryFromApi ?? parseListBatteryPercent(metadata)

  return {
    id: device.device_id,
    name: device.device_name,
    model: formatModelLabel(device),
    location: device.location.trim().length > 0 ? device.location.trim() : '—',
    state: mapRemoteControlState(device.status, battery),
    battery,
    network: formatNetworkLabel(device),
    signal: formatSignalLabel(device),
    lastTest: formatLastTestLabel(device),
  }
}
