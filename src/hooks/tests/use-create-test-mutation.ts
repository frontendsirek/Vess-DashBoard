import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  extractTestIdFromResponse,
  mapCreateTestScheduleDraftToPayload,
} from '@/lib/api-test-mapper'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { CreateTestScheduleDraft } from '@/types/create-test'
import type { ApiTestAction } from '@/types/test'

export type CreateTestMutationVariables = {
  draft: CreateTestScheduleDraft
  action: ApiTestAction
}

export function formatTestMutationError(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined
    return body?.message ?? error.message
  }
  return 'Failed to create test. Please try again.'
}

export function useCreateTestMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationKey: [...testQueryKeys.all, 'create'],
    mutationFn: async ({ draft, action }: CreateTestMutationVariables) => {
      const payload = mapCreateTestScheduleDraftToPayload(draft, action)
      const { data } = await testService.createTest(payload)
      const testId = extractTestIdFromResponse(data) ?? `new-${Date.now()}`
      return { testId, draft }
    },
    onSuccess: ({ testId, draft }) => {
      void queryClient.invalidateQueries({ queryKey: testQueryKeys.all })
      navigate(`/test-management/${testId}`, {
        state: { wizardResult: draft },
        replace: true,
      })
    },
  })
}
