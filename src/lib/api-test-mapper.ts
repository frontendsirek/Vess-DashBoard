import type {
  TestDetailExecutionRow,
  TestDetailRecord,
  TestRecord,
  TestStatus,
  TestType,
} from '@/data/mock'
import { buildTestDetailConfigRows } from '@/lib/build-test-detail-config-rows'
import { formatRelativeLastSeen } from '@/lib/api-device-mapper'
import { formatTestDetailExecutionDateTime, parseScheduleDateTime } from '@/lib/datetime'
import type { ApiEnvelope } from '@/types/api'
import type {
  ConfigureStepRestoreFields,
  CreateTestScheduleDraft,
  CreateTestStep1Draft,
  DataTestMethod,
  EditScheduleRestoreFields,
} from '@/types/create-test'
import type {
  ApiProbe,
  ApiScheduleFrequency,
  ApiTest,
  ApiTestAction,
  ApiTestParameters,
  ApiTestSchedule,
  ApiTestType,
  CreateTestPayload,
  ProbeDeliveryStatusApi,
  UpdateTestPayload,
} from '@/types/test'
import { isValid } from 'date-fns'
import { formatScheduleDateTime } from '@/lib/datetime'
import { FREQUENCY_OPTIONS, RETRY_OPTIONS } from '@/schemas/create-test/schedule.schema'

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

function normalizeProbeApiType(raw?: string | null): ApiTestType {
  const n = (raw ?? '').trim().toLowerCase()
  if (n === 'sms') return 'sms'
  if (n === 'data') return 'data'
  return 'call'
}

function resolveProbeTypeRaw(probe?: ApiProbe | null): string | undefined {
  if (!probe) return undefined
  if (probe.type?.trim()) return probe.type
  const loose = probe as ApiProbe & { test_type?: string; testType?: string }
  if (typeof loose.test_type === 'string' && loose.test_type.trim()) return loose.test_type
  if (typeof loose.testType === 'string' && loose.testType.trim()) return loose.testType
  return undefined
}

function mapProbeDeliveryStatusToTestStatus(raw?: string | null): TestStatus {
  const normalized = (raw ?? '').trim().toLowerCase().replace(/-/g, '_')

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

export function mapCreateTestScheduleDraftToUpdatePayload(
  draft: CreateTestScheduleDraft,
): UpdateTestPayload {
  const { action, ...rest } = mapCreateTestScheduleDraftToPayload(draft, 'activate')
  void action
  return rest
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

export function mapApiProbeToTestRecord(probe: ApiProbe | null | undefined): TestRecord {
  if (!probe) {
    return {
      id: '—',
      name: '—',
      type: 'Call',
      source: '—',
      destination: '—',
      lastRun: '—',
      status: 'Draft',
    }
  }

  const iso = probe.updatedAt ?? probe.createdAt ?? null
  return {
    id: String(probe.id),
    name: probe.name ?? '',
    type: mapApiTestTypeToUi(normalizeProbeApiType(resolveProbeTypeRaw(probe))),
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

export type ProbeEditFormSeed = {
  step1: CreateTestStep1Draft
  configureRestore: ConfigureStepRestoreFields
  scheduleRestore: EditScheduleRestoreFields
}

function isoToScheduleUi(iso?: string): string {
  if (!iso?.trim()) return ''
  const parsed = new Date(iso)
  return isValid(parsed) ? formatScheduleDateTime(parsed) : ''
}

function mapApiFrequencyToUi(frequency?: string): string {
  const normalized = frequency?.trim().toLowerCase()
  if (normalized === 'daily') return 'Daily'
  if (normalized === 'weekly') return 'Weekly'
  return FREQUENCY_OPTIONS[0]
}

function mapAttemptsToRetryLabel(attempts: number | undefined): string {
  if (attempts === undefined || attempts === null) return RETRY_OPTIONS[0]
  if (attempts <= 0) return 'No retry'
  const match = RETRY_OPTIONS.find((option) => option.startsWith(String(attempts)))
  return match ?? `${attempts} attempts`
}

/** Seeds edit wizard forms from GET `/tests/:id` probe payload. */
export function mapApiProbeToEditFormSeed(probe: ApiProbe | null | undefined): ProbeEditFormSeed {
  if (!probe) {
    throw new Error('Probe payload is missing.')
  }

  const apiKind = normalizeProbeApiType(resolveProbeTypeRaw(probe))
  const testType = mapApiTestTypeToUi(apiKind)
  const params = probe.parameters ?? {}
  const schedule = probe.schedule ?? {}
  const scheduleType = schedule.type?.trim().toLowerCase().replace(/-/g, '_')
  const scheduleMode = schedule.mode?.trim().toLowerCase().replace(/-/g, '_')
  const scheduleKind = scheduleType === 'recurring' ? 'recurring' : 'one-time'
  const immediate = scheduleKind === 'one-time' && scheduleMode === 'immediate'

  const durationRaw = pickParam(params, 'durationSeconds', 'duration_seconds')
  const parsedDuration = durationRaw ? Number.parseInt(durationRaw, 10) : Number.NaN
  const callDurationSeconds = Number.isFinite(parsedDuration) ? parsedDuration : 60

  const messageText = pickParam(params, 'message') ?? ''
  const targetRaw = pickParam(params, 'targetServer', 'target_server') ?? ''
  const downloadMbRaw = pickParam(params, 'downloadSizeMB', 'download_size_mb')
  const parsedDownloadMb = downloadMbRaw ? Number.parseFloat(downloadMbRaw) : Number.NaN
  const downloadMb = Number.isFinite(parsedDownloadMb) ? parsedDownloadMb : 1
  const dataTestMethod: DataTestMethod =
    targetRaw.startsWith('http://') || targetRaw.startsWith('https://') ? 'target-url' : 'ping'

  const configureRestore: ConfigureStepRestoreFields = {
    testName: probe.name ?? '',
    description: probe.description ?? '',
    sourceDevice: probe.sourceDeviceId ?? '',
    destinationDevice: probe.destinationDeviceId ?? '',
    callDurationSeconds,
    messageText,
    dataTestMethod,
    dataTargetValue: targetRaw,
    payloadSizeKb: Math.max(1, Math.round(downloadMb * 1024)),
  }

  const scheduleRestore: EditScheduleRestoreFields = {
    scheduleKind,
    immediate,
    scheduledDateTime: isoToScheduleUi(schedule.runAt ?? schedule.startAt),
    retryOnFailure: mapAttemptsToRetryLabel(probe.retryPolicy?.attempts),
    frequency: mapApiFrequencyToUi(schedule.frequency),
    startDateTime: isoToScheduleUi(schedule.startAt),
    endDateTime: isoToScheduleUi(schedule.endAt),
    businessHoursOnly: schedule.businessHoursOnly ?? false,
  }

  return {
    step1: { creationMethod: 'single', testType },
    configureRestore,
    scheduleRestore,
  }
}

type LooseProbeMetrics = ApiProbe & {
  completionPercent?: number
  completion_percent?: number
}

function parseProbeProgressPercent(probe: LooseProbeMetrics): number | undefined {
  const raw =
    probe.progressPercent ??
    probe.progress_percent ??
    probe.completionPercent ??
    probe.completion_percent
  if (raw === undefined || raw === null || Number.isNaN(Number(raw))) return undefined
  const n = Number(raw)
  if (n > 0 && n <= 1) return Math.round(n * 100)
  return Math.round(Math.min(100, Math.max(0, n)))
}

function parseProbeLastExecutionIso(probe: LooseProbeMetrics): string | undefined {
  return (
    probe.lastExecutionAt ??
    probe.last_execution_at ??
    probe.lastRunAt ??
    probe.last_run_at ??
    probe.updatedAt ??
    probe.createdAt
  )
}

function formatProbeSuccessRate(probe: LooseProbeMetrics): string {
  const raw = probe.statistics?.successRate ?? probe.statistics?.success_rate
  if (raw === undefined || raw === null || Number.isNaN(Number(raw))) return '—'
  const n = Number(raw)
  const percent = n > 0 && n <= 1 ? n * 100 : n
  return `${percent.toFixed(1)}%`
}

function formatProbeAvgDuration(probe: LooseProbeMetrics): string {
  const raw = probe.statistics?.avgDurationSeconds ?? probe.statistics?.avg_duration_seconds
  if (raw === undefined || raw === null || Number.isNaN(Number(raw))) return '—'
  const seconds = Math.round(Number(raw))
  return `${seconds}s`
}

function formatProbeTotalRuns(probe: LooseProbeMetrics): string {
  const raw = probe.statistics?.totalRuns ?? probe.statistics?.total_runs
  if (raw === undefined || raw === null || Number.isNaN(Number(raw))) return '0'
  return String(Math.max(0, Math.round(Number(raw))))
}

function formatExecutionDetail(entry: Record<string, unknown>): string {
  const successRaw = entry.success ?? entry.status ?? entry.result
  const success =
    successRaw === true ||
    successRaw === 'success' ||
    String(successRaw).toLowerCase() === 'passed'

  const durationRaw =
    entry.durationSeconds ?? entry.duration_seconds ?? entry.duration ?? entry.elapsedSeconds
  const durationSeconds =
    durationRaw !== undefined && !Number.isNaN(Number(durationRaw)) ?
      Math.round(Number(durationRaw))
    : undefined

  const signalRaw = entry.signal ?? entry.signalDbm ?? entry.signal_dbm ?? entry.signalStrength
  const signal =
    signalRaw !== undefined && signalRaw !== null && String(signalRaw).trim() !== '' ?
      String(signalRaw).includes('dBm') ?
        String(signalRaw)
      : `${signalRaw}dBm`
    : undefined

  const parts: string[] = []
  if (durationSeconds !== undefined) {
    parts.push(`${success ? 'Success' : 'Failed'} (${durationSeconds}s)`)
  } else {
    parts.push(success ? 'Success' : 'Failed')
  }

  if (signal) {
    parts.push(`Signal: ${signal}`)
  }

  return parts.join(' | ')
}

function mapProbeExecutions(probe: LooseProbeMetrics): TestDetailExecutionRow[] {
  const rawList = probe.recentExecutions ?? probe.recent_executions ?? probe.executions
  if (!Array.isArray(rawList)) return []

  return rawList
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null
      const row = entry as Record<string, unknown>
      const iso =
        (typeof row.executedAt === 'string' && row.executedAt) ||
        (typeof row.executed_at === 'string' && row.executed_at) ||
        (typeof row.timestamp === 'string' && row.timestamp) ||
        (typeof row.createdAt === 'string' && row.createdAt) ||
        (typeof row.created_at === 'string' && row.created_at)

      const timestamp = iso ? formatTestDetailExecutionDateTime(iso) : undefined
      if (!timestamp) return null

      const successRaw = row.success ?? row.status ?? row.result
      const success =
        successRaw === true ||
        successRaw === 'success' ||
        String(successRaw).toLowerCase() === 'passed'

      return {
        id: String(row.id ?? `${probe.id}-${index}`),
        success,
        timestamp,
        detail: formatExecutionDetail(row),
      }
    })
    .filter((row): row is TestDetailExecutionRow => row !== null)
}

/** Map GET probe payload to UI detail shown on [TestDetailPage](src/pages/test-management/TestDetailPage.tsx). */
export function mapApiProbeToTestDetailRecord(
  probe: ApiProbe | null | undefined,
  deviceNameById?: ReadonlyMap<string, string>,
): TestDetailRecord {
  if (!probe) {
    throw new Error('Probe payload is missing.')
  }

  const looseProbe = probe as LooseProbeMetrics
  const apiKind = normalizeProbeApiType(resolveProbeTypeRaw(probe))
  const testType = mapApiTestTypeToUi(apiKind)
  const status = mapProbeDeliveryStatusToTestStatus(probe.deliveryStatus)
  const lastExecutionIso = parseProbeLastExecutionIso(looseProbe)
  const lastExecutionFormatted = formatTestDetailExecutionDateTime(lastExecutionIso)
  const lastExecutionLabel =
    lastExecutionFormatted ??
    (lastExecutionIso ? formatRelativeLastSeen(lastExecutionIso) : undefined) ??
    'N/A'

  const progressPercent =
    status === 'Running' ? parseProbeProgressPercent(looseProbe) : undefined

  const configRowPairs = buildTestDetailConfigRows({
    testType,
    apiKind,
    description: probe.description,
    sourceDeviceId: probe.sourceDeviceId,
    destinationDeviceId: probe.destinationDeviceId,
    parameters: probe.parameters,
    schedule: probe.schedule,
    retryAttempts: probe.retryPolicy?.attempts,
    deviceNameById,
  })

  const executions = mapProbeExecutions(looseProbe)

  return {
    id: String(probe.id),
    name: probe.name ?? '',
    status,
    progressPercent,
    lastExecutionLabel,
    successRate: formatProbeSuccessRate(looseProbe),
    avgDuration: formatProbeAvgDuration(looseProbe),
    totalRuns: formatProbeTotalRuns(looseProbe),
    configRowPairs,
    executions,
    executionsEmptyMessage: 'No executions yet',
  }
}
