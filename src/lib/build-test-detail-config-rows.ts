import type { TestType } from '@/data/mock'
import type { ApiProbeSchedule, ApiTestType } from '@/types/test'

export type TestDetailConfigCell = {
  label: string
  value: string
  hideValue?: boolean
}

export type TestDetailConfigRow = {
  left: TestDetailConfigCell
  right?: TestDetailConfigCell
}

function pickParam(
  params: Record<string, string | undefined> | undefined,
  ...keys: string[]
): string | undefined {
  if (!params) return undefined
  for (const key of keys) {
    const v = params[key]
    if (v !== undefined && v !== '') return v
  }
  return undefined
}

export function resolveDeviceDisplayName(
  deviceId: string | undefined,
  deviceNameById?: ReadonlyMap<string, string>,
): string {
  if (!deviceId?.trim()) return '—'
  return deviceNameById?.get(deviceId) ?? deviceId
}

/** Schedule label only — execution window is a separate row per Figma. */
export function formatProbeScheduleLabel(schedule: ApiProbeSchedule | undefined): string {
  if (!schedule) return '—'

  const typeNormalized = schedule.type?.toLowerCase()?.replace(/-/g, '_')
  const modeNormalized = schedule.mode?.toLowerCase()?.replace(/-/g, '_')

  if (typeNormalized === 'recurring') {
    const fq = schedule.frequency?.trim().toLowerCase() ?? 'scheduled'
    return `Recurring (${fq})`
  }

  if (modeNormalized === 'immediate') {
    return 'One-Time (immediate)'
  }

  return 'One-Time'
}

function buildExecutionWindowCell(schedule: ApiProbeSchedule | undefined): TestDetailConfigCell {
  if (schedule?.businessHoursOnly) {
    return { label: 'Execution Window', value: 'Business hours only' }
  }

  const typeNormalized = schedule?.type?.toLowerCase()?.replace(/-/g, '_')
  if (typeNormalized === 'one_time') {
    return { label: 'Execution Window', value: '—', hideValue: true }
  }

  return { label: 'Execution Window', value: 'Any time' }
}

function buildCallDurationCell(params: Record<string, string | undefined> | undefined): TestDetailConfigCell {
  const seconds = pickParam(params, 'durationSeconds', 'duration_seconds')
  return {
    label: 'Call Duration',
    value: seconds !== undefined ? `${seconds}s` : '—',
  }
}

function buildMessageTextCell(params: Record<string, string | undefined> | undefined): TestDetailConfigCell {
  const msg = pickParam(params, 'message')
  return {
    label: 'Message Text',
    value: msg?.trim() ? msg : '—',
  }
}

function buildDataTestMethodCell(params: Record<string, string | undefined> | undefined): TestDetailConfigCell {
  const target = pickParam(params, 'targetServer', 'target_server') ?? ''
  const methodLabel =
    target.startsWith('http://') || target.startsWith('https://') ? 'Target URL' : 'Ping'
  return { label: 'Test Method', value: methodLabel }
}

function buildDataTargetCell(params: Record<string, string | undefined> | undefined): TestDetailConfigCell {
  const target = pickParam(params, 'targetServer', 'target_server')
  const targetRaw = target ?? ''
  const label =
    targetRaw.startsWith('http://') || targetRaw.startsWith('https://') ? 'Endpoint URL' : 'Host / IP'
  return {
    label,
    value: targetRaw.trim() ? targetRaw : '—',
  }
}

function buildDataPayloadCell(params: Record<string, string | undefined> | undefined): TestDetailConfigCell {
  const downloadMbRaw = pickParam(params, 'downloadSizeMB', 'download_size_mb')
  const parsedDownloadMb = downloadMbRaw ? Number.parseFloat(downloadMbRaw) : Number.NaN
  const payloadKb =
    Number.isFinite(parsedDownloadMb) ? Math.max(1, Math.round(parsedDownloadMb * 1024)) : undefined
  return {
    label: 'Payload (KB)',
    value: payloadKb !== undefined ? String(payloadKb) : '—',
  }
}

type BuildConfigRowsInput = {
  testType: TestType
  apiKind: ApiTestType
  description?: string | null
  sourceDeviceId?: string
  destinationDeviceId?: string
  parameters?: Record<string, string | undefined>
  schedule?: ApiProbeSchedule
  retryAttempts?: number
  deviceNameById?: ReadonlyMap<string, string>
}

/** Builds configuration rows in Figma order (explicit left/right pairs). */
export function buildTestDetailConfigRows(input: BuildConfigRowsInput): TestDetailConfigRow[] {
  const {
    testType,
    apiKind,
    description,
    sourceDeviceId,
    destinationDeviceId,
    parameters,
    schedule,
    retryAttempts,
    deviceNameById,
  } = input

  const retryValue = retryAttempts !== undefined ? String(retryAttempts) : '—'
  const scheduleCell: TestDetailConfigCell = {
    label: 'Schedule',
    value: formatProbeScheduleLabel(schedule),
  }
  const retryCell: TestDetailConfigCell = { label: 'Retry Attempts', value: retryValue }
  const executionWindowCell = buildExecutionWindowCell(schedule)

  const rows: TestDetailConfigRow[] = [
    {
      left: { label: 'Type', value: testType },
      right: { label: 'Description', value: description?.trim() ? description.trim() : 'N/A' },
    },
    {
      left: {
        label: 'Source Device',
        value: resolveDeviceDisplayName(sourceDeviceId, deviceNameById),
      },
    },
  ]

  if (apiKind === 'data') {
    rows[1]!.right = buildDataTestMethodCell(parameters)
    rows.push(
      { left: scheduleCell, right: buildDataTargetCell(parameters) },
      { left: retryCell, right: buildDataPayloadCell(parameters) },
    )
    if (schedule?.businessHoursOnly) {
      rows.push({ left: executionWindowCell })
    }
    return rows
  }

  rows[1]!.right = {
    label: 'Destination',
    value: resolveDeviceDisplayName(destinationDeviceId, deviceNameById),
  }

  const typeSpecificCell =
    apiKind === 'sms' ? buildMessageTextCell(parameters) : buildCallDurationCell(parameters)

  rows.push(
    { left: scheduleCell, right: typeSpecificCell },
    { left: retryCell, right: executionWindowCell },
  )

  return rows
}
