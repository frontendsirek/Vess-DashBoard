import { apiClient } from '@/lib/axios-client'
import type { ApiEnvelope } from '@/types/api'
import type {
  ApiCommand,
  ApiTest,
  BulkCreateTestPayload,
  CreateTestPayload,
  PullCommandsParams,
  UpdateTestPayload,
} from '@/types/test'

const TESTS_PREFIX = `/v1/tests`
const COMMANDS_PREFIX = `/v1/commands`

export const testService = {
  health() {
    return apiClient.get(`/health`)
  },

  createTest(payload: CreateTestPayload) {
    return apiClient.post<ApiTest | ApiEnvelope<ApiTest>>(TESTS_PREFIX, payload)
  },

  bulkCreateTests(payload: BulkCreateTestPayload) {
    return apiClient.post<ApiTest[] | ApiEnvelope<ApiTest[]>>(TESTS_PREFIX, payload)
  },

  updateTest(testId: string, payload: UpdateTestPayload) {
    return apiClient.patch<ApiTest | ApiEnvelope<ApiTest>>(
      `${TESTS_PREFIX}/${testId}`,
      payload,
    )
  },

  pullCommands(params: PullCommandsParams) {
    return apiClient.get<ApiCommand[] | ApiEnvelope<ApiCommand[]>>(COMMANDS_PREFIX, {
      params,
    })
  },
}
