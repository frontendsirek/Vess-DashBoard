import type { TestRecord, TestStatus, TestType } from '@/data/mock'
import { parseScheduleDateTime } from '@/lib/datetime'
import type { ApiEnvelope } from '@/types/api'
import type { CreateTestScheduleDraft } from '@/types/create-test'
import type {
  ApiScheduleFrequency,
  ApiTest,
  ApiTestAction,
  ApiTestParameters,
  ApiTestSchedule,
  ApiTestType,
  CreateTestPayload,
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
    }

    const startAt = toIsoDateTime(draft.startDateTime)
    if (startAt) schedule.startAt = startAt

    const endAt = toIsoDateTime(draft.endDateTime)
    if (endAt) schedule.endAt = endAt

    if (draft.businessHoursOnly) {
      schedule.businessHoursStart = '09:00'
      schedule.businessHoursEnd = '17:00'
    }

    return schedule
  }

  if (draft.immediate) {
    return {
      type: 'one_time',
      mode: 'immediate',
      timezone: DEFAULT_TIMEZONE,
    }
  }

  const runAt = toIsoDateTime(draft.scheduledDateTime)
  return {
    type: 'one_time',
    mode: 'scheduled',
    timezone: DEFAULT_TIMEZONE,
    ...(runAt ? { runAt } : {}),
  }
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
    return data.data.id
  }
  if ('id' in data && typeof data.id === 'string') {
    return data.id
  }
  return undefined
}

export function mapApiTestToTestRecord(test: ApiTest, fallbackStatus: TestStatus = 'Scheduled'): TestRecord {
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
