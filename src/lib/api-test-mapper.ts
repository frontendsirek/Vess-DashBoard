import type { TestDetailRecord, TestRecord, TestStatus, TestType } from '@/data/mock'
import { formatRelativeLastSeen } from '@/lib/api-device-mapper'
import { parseScheduleDateTime } from '@/lib/datetime'
import type { ApiEnvelope } from '@/types/api'
import type { CreateTestScheduleDraft } from '@/types/create-test'
import type {
  ApiProbe,
  ApiProbeSchedule,
  ApiScheduleFrequency,
  ApiTest,
  ApiTestAction,
  ApiTestParameters,
  ApiTestSchedule,
  ApiTestType,
  CreateTestPayload,
  ProbeDeliveryStatusApi,
} from '@/types/test'

const DEFAULT_TIMEZONE = 'Africa/Lagos'

function mapUiTestTypeToApi(type: TestType | null): ApiTestType {
  switch (type) {
    case 'Call':
      return 'call'
    case 'SMS':
      return 'sms'
    case 'Data':
      return 'data'
    default:
      return 'call'
  }
}

function mapApiTestTypeToUi(type: ApiTestType): TestType {
  switch (type) {
    case 'call':
      return 'Call'
    case 'sms':
      return 'SMS'
    case 'data':
      return 'Data'
  }
}

function normalizeProbeApiType(raw: string): ApiTestType {
  const n = raw.trim().toLowerCase()
  if (n === 'sms') return 'sms'
  if (n === 'data') return 'data'
  return 'call'
}

function mapProbeDeliveryStatusToTestStatus(raw: string): TestStatus {
  const normalized = raw.trim().toLowerCase().replace(/-/g, '_')

  switch (normalized) {
    case 'draft':
      return 'Draft'
    case 'ready':
      return 'Ready'
    case 'running':
      return 'Running'
    case 'cancel_requested':
      return 'Cancel requested'
    case 'canceled':
    case 'cancelled':
      return 'Canceled'
    default:
      break
  }

  /** Legacy UI strings already aligned */
  if (
    raw === 'Draft' ||
    raw === 'Ready' ||
    raw === 'Running' ||
    raw === 'Cancel requested' ||
    raw === 'Canceled'
  ) {
    return raw
  }
  if (normalized === 'scheduled') return 'Draft'
  if (normalized === 'completed') return 'Ready'

  return 'Draft'
}

function parseRetryAttempts(retryOnFailure: string): number {
  const match = retryOnFailure.match(/(\d+)/)
  if (match) return Number.parseInt(match[1], 10)
  return 0
}

function mapUiFrequencyToApi(frequency: string): ApiScheduleFrequency {
  const normalized = frequency.trim().toLowerCase()
  if (normalized === 'daily') return 'daily'
  if (normalized === 'weekly') return 'weekly'
  return 'hourly'
}

function toIsoDateTime(value: string): string | undefined {
  const parsed = parseScheduleDateTime(value)
  return parsed ? parsed.toISOString() : undefined
}

function buildParameters(draft: CreateTestScheduleDraft): ApiTestParameters {
  const apiType = mapUiTestTypeToApi(draft.testType)

  if (apiType === 'call') {
    return { durationSeconds: draft.callDurationSeconds }
  }

  if (apiType === 'sms') {
    return { message: draft.messageText }
  }

  const downloadMb = Math.max(1, Math.round(draft.payloadSizeKb / 1024))
  return {
    targetServer: draft.dataTargetValue,
    downloadSizeMB: downloadMb,
    uploadSizeMB: Math.max(1, Math.round(downloadMb / 5)),
  }
}

function buildSchedule(draft: CreateTestScheduleDraft): ApiTestSchedule {
  if (draft.scheduleKind === 'recurring') {
    const schedule: ApiTestSchedule = {
      type: 'recurring',
      frequency: mapUiFrequencyToApi(draft.frequency),
      timezone: DEFAULT_TIMEZONE,
      businessHoursOnly: draft.businessHoursOnly,
      businessHoursStart: '09:00',
      businessHoursEnd: '17:00',
      mode: 'scheduled',
    }

    const startAt = toIsoDateTime(draft.startDateTime)
    if (startAt) schedule.startAt = startAt

    const endAt = toIsoDateTime(draft.endDateTime)
    if (endAt) schedule.endAt = endAt

    return schedule
  }

  if (draft.immediate) {
    return {
      type: 'one_time',
      mode: 'immediate',
      timezone: DEFAULT_TIMEZONE,
    }
  }

  /** Matches test-service `POST /test/v1/tests` full schedule for one-shot scheduled runs. */
  const runAt = toIsoDateTime(draft.scheduledDateTime)
  const schedule: ApiTestSchedule = {
    type: 'one_time',
    mode: 'scheduled',
    timezone: DEFAULT_TIMEZONE,
    frequency: mapUiFrequencyToApi(draft.frequency),
    businessHoursOnly: draft.businessHoursOnly,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
  }

  if (runAt) {
    schedule.runAt = runAt
    schedule.startAt = runAt
    const windowEnd = toIsoDateTime(draft.endDateTime)
    schedule.endAt = windowEnd ?? runAt
  }

  return schedule
}

export function mapCreateTestScheduleDraftToPayload(
  draft: CreateTestScheduleDraft,
  action: ApiTestAction,
): CreateTestPayload {
  const type = mapUiTestTypeToApi(draft.testType)
  const payload: CreateTestPayload = {
    name: draft.testName,
    description: draft.description,
    type,
    sourceDeviceId: draft.sourceDevice,
    parameters: buildParameters(draft),
    schedule: buildSchedule(draft),
    retryPolicy: { attempts: parseRetryAttempts(draft.retryOnFailure) },
    action,
  }

  if (type === 'call' || type === 'sms') {
    payload.destinationDeviceId = draft.destinationDevice
  }

  return payload
}

export function extractTestIdFromResponse(
  data: ApiTest | ApiEnvelope<ApiTest>,
): string | undefined {
  if ('data' in data && data.data && typeof data.data === 'object' && 'id' in data.data) {
    const idVal = (data.data as ApiTest).id
    return idVal === undefined || idVal === null ? undefined : String(idVal)
  }
  if ('id' in data) {
    const idVal = (data as ApiTest).id
    return String(idVal)
  }
  return undefined
}

export function mapApiTestToTestRecord(test: ApiTest, fallbackStatus: TestStatus = 'Draft'): TestRecord {
  return {
    id: test.id,
    name: test.name,
    type: mapApiTestTypeToUi(test.type),
    source: test.sourceDeviceId ?? '—',
    destination: test.destinationDeviceId ?? '—',
    lastRun: '—',
    status: fallbackStatus,
  }
}

export function mapUiDeliveryStatusFilterToApi(statusFilter: string): ProbeDeliveryStatusApi | undefined {
  switch (statusFilter) {
    case 'Draft':
      return 'draft'
    case 'Ready':
      return 'ready'
    case 'Running':
      return 'running'
    case 'Cancel requested':
      return 'cancel_requested'
    case 'Canceled':
      return 'canceled'
    default:
      return undefined
  }
}

export function mapUiTestTypeFilterToApi(typeFilter: string): ApiTestType | undefined {
  switch (typeFilter) {
    case 'Call':
      return 'call'
    case 'SMS':
      return 'sms'
    case 'Data':
      return 'data'
    default:
      return undefined
  }
}

export function mapApiProbeToTestRecord(probe: ApiProbe): TestRecord {
  const iso = probe.updatedAt ?? probe.createdAt ?? null
  return {
    id: String(probe.id),
    name: probe.name,
    type: mapApiTestTypeToUi(normalizeProbeApiType(probe.type)),
    source: probe.sourceDeviceId ?? '—',
    destination: probe.destinationDeviceId ?? '—',
    lastRun: formatRelativeLastSeen(iso),
    status: mapProbeDeliveryStatusToTestStatus(probe.deliveryStatus),
  }
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

function formatProbeScheduleSummary(schedule: ApiProbeSchedule | undefined): string {
  if (!schedule) return '—'

  const typeNormalized = schedule.type?.toLowerCase()?.replace(/-/g, '_')
  const modeNormalized = schedule.mode?.toLowerCase()?.replace(/-/g, '_')
  const parts: string[] = []

  if (typeNormalized === 'recurring') {
    const fq = schedule.frequency?.trim() ?? 'scheduled'
    parts.push(`Recurring (${fq.toLowerCase()})`)
    if (schedule.startAt || schedule.endAt) {
      const window = [schedule.startAt, schedule.endAt].filter(Boolean).join(' → ')
      if (window) parts.push(window)
    }
  } else if (typeNormalized === 'one_time' || schedule.runAt !== undefined || modeNormalized) {
    if (modeNormalized === 'immediate') {
      parts.push('One-Time (immediate)')
    } else if (schedule.runAt) {
      parts.push(`One-Time (${schedule.runAt})`)
    } else {
      parts.push('One-Time')
    }
  }

  if (schedule.businessHoursOnly) {
    const bh =
      schedule.businessHoursStart && schedule.businessHoursEnd
        ? `Business hours (${schedule.businessHoursStart}–${schedule.businessHoursEnd})`
        : 'Business hours only'
    parts.push(bh)
  }

  if (schedule.timezone) {
    parts.push(`TZ ${schedule.timezone}`)
  }

  if (parts.length > 0) return parts.join(' · ')
  if (schedule.runAt) return schedule.runAt
  return '—'
}

function appendProbeParameterRows(
  probe: ApiProbe,
  apiKind: ApiTestType,
  rows: { label: string; value: string }[],
) {
  const p = probe.parameters

  if (apiKind === 'call') {
    const seconds = pickParam(p, 'durationSeconds', 'duration_seconds')
    if (seconds !== undefined) {
      rows.push({ label: 'Call Duration', value: `${seconds}s` })
    }
    return
  }

  if (apiKind === 'sms') {
    const msg = pickParam(p, 'message')
    rows.push({
      label: 'Message Text',
      value: msg?.trim() ? msg : '—',
    })
    return
  }

  const target = pickParam(p, 'targetServer', 'target_server')
  const down = pickParam(p, 'downloadSizeMB', 'download_size_mb')
  const up = pickParam(p, 'uploadSizeMB', 'upload_size_mb')
  if (target !== undefined) rows.push({ label: 'Target server', value: target })
  if (down !== undefined) rows.push({ label: 'Download (MB)', value: down })
  if (up !== undefined) rows.push({ label: 'Upload (MB)', value: up })
}

/** Map GET probe payload to UI detail shown on [TestDetailPage](src/pages/test-management/TestDetailPage.tsx). */
export function mapApiProbeToTestDetailRecord(probe: ApiProbe): TestDetailRecord {
  const apiKind = normalizeProbeApiType(probe.type)
  const iso = probe.updatedAt ?? probe.createdAt ?? null
  const relative = iso ? formatRelativeLastSeen(iso) : undefined
  const lastExecutionLabel = relative !== '—' && relative !== undefined ? relative : 'N/A'

  const configRows: { label: string; value: string }[] = [
    { label: 'Type', value: mapApiTestTypeToUi(apiKind) },
    { label: 'Description', value: probe.description?.trim() ? probe.description.trim() : 'N/A' },
    { label: 'Source Device', value: probe.sourceDeviceId ?? '—' },
  ]

  if (apiKind !== 'data') {
    configRows.push({ label: 'Destination', value: probe.destinationDeviceId ?? '—' })
  }

  appendProbeParameterRows(probe, apiKind, configRows)

  configRows.push(
    { label: 'Schedule', value: formatProbeScheduleSummary(probe.schedule) },
    {
      label: 'Retry Attempts',
      value: probe.retryPolicy?.attempts !== undefined ? String(probe.retryPolicy.attempts) : '—',
    },
  )

  if (probe.enabled !== undefined) {
    configRows.push({ label: 'Enabled', value: probe.enabled ? 'Yes' : 'No' })
  }

  return {
    id: String(probe.id),
    name: probe.name,
    status: mapProbeDeliveryStatusToTestStatus(probe.deliveryStatus),
    lastExecutionLabel,
    successRate: '—',
    avgDuration: '—',
    totalRuns: '0',
    configRows,
    executions: [],
    executionsEmptyMessage: 'No executions yet',
  }
}
