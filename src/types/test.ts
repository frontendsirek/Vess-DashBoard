/** API test type (lowercase, as sent to test-service). */
export type ApiTestType = 'call' | 'sms' | 'data'

export type ApiTestAction = 'activate' | 'draft'

export type ApiScheduleType = 'one_time' | 'recurring'

export type ApiScheduleMode = 'immediate' | 'scheduled'

export type ApiScheduleFrequency = 'hourly' | 'daily' | 'weekly'

export type ApiTestSchedule = {
  type: ApiScheduleType
  mode?: ApiScheduleMode
  frequency?: ApiScheduleFrequency
  runAt?: string
  startAt?: string
  endAt?: string
  timezone?: string
  businessHoursOnly?: boolean
  businessHoursStart?: string
  businessHoursEnd?: string
}

export type ApiCallParameters = {
  durationSeconds: number
}

export type ApiSmsParameters = {
  message: string
}

export type ApiDataParameters = {
  targetServer?: string
  downloadSizeMB?: number
  uploadSizeMB?: number
}

export type ApiTestParameters = ApiCallParameters | ApiSmsParameters | ApiDataParameters

export type ApiRetryPolicy = {
  attempts: number
}

export type CreateTestPayload = {
  name: string
  description: string
  type: ApiTestType
  sourceDeviceId: string
  destinationDeviceId?: string
  parameters: ApiTestParameters
  schedule: ApiTestSchedule
  retryPolicy: ApiRetryPolicy
  action: ApiTestAction
}

export type BulkCreateTestItem = Omit<CreateTestPayload, 'action'> & {
  action?: ApiTestAction
}

export type BulkCreateTestPayload = {
  items: BulkCreateTestItem[]
}

export type UpdateTestPayload = Partial<
  Omit<CreateTestPayload, 'action'> & { enabled?: boolean }
>

export type PullCommandsParams = {
  deviceId: string
  limit?: number
}

/** Minimal test resource shape returned by test-service (extend when OpenAPI is available). */
export type ApiTest = {
  id: string
  name: string
  description?: string
  type: ApiTestType
  sourceDeviceId?: string
  destinationDeviceId?: string
  action?: ApiTestAction
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ApiCommand = {
  id: string
  type?: string
  deviceId?: string
  payload?: Record<string, unknown>
}
