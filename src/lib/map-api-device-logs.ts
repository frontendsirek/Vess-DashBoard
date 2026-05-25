import { format, parseISO } from 'date-fns'
import type { DeviceLogEntry, DeviceLogLevel } from '@/data/device-management'
import type { ApiDeviceLog } from '@/types/device'

const KNOWN_LEVELS = new Set<DeviceLogLevel>(['INFO', 'DEBUG', 'WARNING', 'ERROR'])

function mapLogLevel(raw: string | undefined): DeviceLogLevel {
  const normalized = (raw ?? '').trim().toUpperCase()
  if (normalized === 'CRITICAL') return 'ERROR'
  if (KNOWN_LEVELS.has(normalized as DeviceLogLevel)) return normalized as DeviceLogLevel
  return 'INFO'
}

function formatLogTimestamp(iso: string | undefined): string {
  if (!iso?.trim().length) return '-'
  try {
    const d = parseISO(iso.trim())
    if (Number.isNaN(d.getTime())) return '-'
    return format(d, 'HH:mm:ss')
  } catch {
    return '-'
  }
}

function readLogCategory(context: ApiDeviceLog['context']): string {
  if (!context || typeof context !== 'object') return 'System'
  const category = context.category
  if (typeof category === 'string' && category.trim().length) {
    const trimmed = category.trim()
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  }
  return 'System'
}

export function mapApiDeviceLogsToEntries(logs: ApiDeviceLog[] | null | undefined): DeviceLogEntry[] {
  if (!Array.isArray(logs)) return []

  return logs.map((log) => ({
    id: log.id,
    level: mapLogLevel(log.level),
    category: readLogCategory(log.context),
    message: log.message?.trim() || '-',
    timestamp: formatLogTimestamp(log.timestamp || log.created_at),
  }))
}
