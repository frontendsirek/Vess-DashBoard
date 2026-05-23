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

/** Delivery status values accepted by test-service list/detail APIs (snake_case). */
export type ProbeDeliveryStatusApi =
  | 'draft'
  | 'ready'
  | 'running'
  | 'cancel_requested'
  | 'canceled'

export type ListProbesParams = {
  search?: string
  type?: ApiTestType
  deliveryStatus?: ProbeDeliveryStatusApi
  device_id?: string
  page?: number
  pageSize?: number
}

export type ApiProbeSchedule = {
  businessHoursEnd?: string
  businessHoursOnly?: boolean
  businessHoursStart?: string
  endAt?: string
  frequency?: string
  mode?: string
  runAt?: string
  startAt?: string
  timezone?: string
  type?: string
}

export type ApiProbe = {
  id: number
  name: string
  description?: string
  type: string
  sourceDeviceId?: string
  destinationDeviceId?: string
  deliveryStatus: string
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  parameters?: Record<string, string | undefined>
  retryPolicy?: { attempts?: number }
  schedule?: ApiProbeSchedule
}

export type ListProbesPageable = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ListProbesQueryEcho = {
  deliveryStatus?: string
  search?: string
  type?: string
}

export type ListProbesData = {
  items: ApiProbe[]
  pageable: ListProbesPageable
  query?: ListProbesQueryEcho
}

export type ListProbesApiErrorBody = {
  code?: string
  description?: string
}

/** Row-level error from bulk CSV import (`POST /test/v1/tests/bulk/csv`). */
export type BulkCsvImportRowError = {
  rowNumber: number
  error: string
  data?: Record<string, unknown>
}

/** Successful rows use the same probe shape as list/detail APIs. */
export type BulkCsvImportData = {
  errors: BulkCsvImportRowError[]
  failureCount: number
  items: ApiProbe[]
  successCount: number
}

/** Bulk CSV multipart import envelope. */
export type BulkCsvImportResponse = {
  isSuccess: boolean
  message?: string
  data: BulkCsvImportData
  error?: ListProbesApiErrorBody
}

/** JSON body when bulk CSV template is unavailable (`GET .../bulk/template`). */
export type BulkTemplateEnvelope = {
  isSuccess: boolean
  message?: string
  error?: ListProbesApiErrorBody
}

/** List envelopes from test-service (`GET /test/v1/tests`). */
export type ListProbesResponse = {
  isSuccess: boolean
  message?: string
  data: ListProbesData
  error?: ListProbesApiErrorBody
}

/** Optional row shape on dashboard response (subset of probe fields). */
export type ApiDashboardProbeRow = {
  id: number
  name: string
  type: string
  deliveryStatus: string
  sourceDeviceId?: string
  destinationDeviceId?: string
  createdAt?: string
  updatedAt?: string
  lastRunAt?: string
}

export type TestsDashboardSummary = {
  activeTests: number
  avgNetworkSpeedMbps: number
  completedToday: number
  failedTests: number
}

export type TestsDashboardParams = {
  search?: string
  type?: ApiTestType
  deliveryStatus?: ProbeDeliveryStatusApi
}

export type TestsDashboardData = {
  summary: TestsDashboardSummary
  items?: ApiDashboardProbeRow[]
  pageable?: ListProbesPageable
  query?: ListProbesQueryEcho
}

/** Dashboard KPI envelope (`GET /test/v1/tests/dashboard`). */
export type TestsDashboardResponse = {
  isSuccess: boolean
  message?: string
  data: TestsDashboardData
  error?: ListProbesApiErrorBody
}

/** Single probe from test-service (`GET /test/v1/tests/:id`). */
export type GetProbeResponse = {
  isSuccess: boolean
  message?: string
  data: ApiProbe
  error?: ListProbesApiErrorBody
}

/** Delete probe envelope (`DELETE /test/v1/tests/:id`). */
export type DeleteProbeResponse = {
  isSuccess: boolean
  message?: string
  data?: unknown
  error?: ListProbesApiErrorBody
}

/** Update probe envelope (`PATCH /test/v1/tests/:id`). */
export type UpdateProbeResponse = {
  isSuccess: boolean
  message?: string
  data: ApiProbe
  error?: ListProbesApiErrorBody
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
