import { format, parseISO } from 'date-fns'
import type {
  DeviceTestHistoryKind,
  DeviceTestHistoryOutcome,
  DeviceTestHistoryRow,
} from '@/data/device-management'

function mapOutcomeFromApi(raw: unknown): DeviceTestHistoryOutcome {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (!s.length) return 'Running'
  if (/success|passed|succeeded|complete|ok|done/.test(s)) return 'Success'
  if (/fail|error|errors|timeout|abort/.test(s)) return 'Failed'
  if (/run|pending|progress|start/.test(s)) return 'Running'
  return 'Running'
}

function mapKindFromApi(raw: unknown): DeviceTestHistoryKind {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (s.includes('sms')) return 'SMS'
  if (s.includes('ussd')) return 'USSD'
  return 'Call'
}

function formatApiTestDisplayTime(iso: string | undefined): { dateDisplay: string; timeDisplay: string } {
  if (!iso?.trim().length) return { dateDisplay: '-', timeDisplay: '-' }
  try {
    const d = parseISO(iso.trim())
    if (Number.isNaN(d.getTime())) return { dateDisplay: '-', timeDisplay: '-' }
    return { dateDisplay: format(d, 'dd/MM/yyyy'), timeDisplay: format(d, 'HH:mm:ss') }
  } catch {
    return { dateDisplay: '-', timeDisplay: '-' }
  }
}

/** Maps GET device `recent_tests` entries into rows for DeviceTestHistoryTable. */
export function mapRecentTestsToDeviceTestHistoryRows(
  routeDeviceId: string,
  recent: unknown[] | null | undefined,
): DeviceTestHistoryRow[] {
  if (!Array.isArray(recent)) return []

  return recent.map((entry, index): DeviceTestHistoryRow => {
    const o = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {}

    const kindRaw = typeof o.kind === 'string' ? o.kind : o.test_type
    const outcomeRaw =
      typeof o.outcome === 'string' ? o.outcome : o.result ?? o.status

    const targetRaw =
      (typeof o.target_msisdn === 'string' && o.target_msisdn) ||
      (typeof o.phone_number === 'string' && o.phone_number) ||
      (typeof o.msisdn === 'string' && o.msisdn) ||
      '-'

    const detailRaw =
      (typeof o.message === 'string' && o.message) ||
      (typeof o.detail === 'string' && o.detail) ||
      (typeof o.summary === 'string' && o.summary) ||
      '-'

    const durationRaw = o.duration_seconds ?? o.duration
    let durationSeconds = 0
    if (typeof durationRaw === 'number' && Number.isFinite(durationRaw) && durationRaw >= 0) {
      durationSeconds = Math.round(durationRaw)
    } else if (typeof durationRaw === 'string' && durationRaw.trim()) {
      const n = Number.parseFloat(durationRaw)
      durationSeconds = Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
    }

    const isoTime =
      (typeof o.completed_at === 'string' && o.completed_at) ||
      (typeof o.updated_at === 'string' && o.updated_at) ||
      (typeof o.created_at === 'string' && o.created_at) ||
      undefined

    const { dateDisplay, timeDisplay } = formatApiTestDisplayTime(isoTime)

    let additionalInfo = '---'
    const latMs = o.latency_ms ?? o.latency
    if (typeof latMs === 'number' && Number.isFinite(latMs)) additionalInfo = `Latency: ${Math.round(latMs)}ms`
    else if (typeof latMs === 'string' && latMs.trim())
      additionalInfo = `Latency: ${latMs.trim()}`

    return {
      id: `${routeDeviceId}-recent-${index}`,
      kind: mapKindFromApi(kindRaw),
      targetMsisdn: String(targetRaw).trim() || '-',
      detailLine: String(detailRaw).trim() || '-',
      durationSeconds,
      dateDisplay,
      timeDisplay,
      additionalInfo,
      outcome: mapOutcomeFromApi(outcomeRaw),
    }
  })
}
