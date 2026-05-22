import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  mapCreateTestScheduleDraftToPayload,
} from '@/lib/api-test-mapper'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { CreateTestScheduleDraft } from '@/types/create-test'
import type { ApiTestAction } from '@/types/test'
import { toast } from 'sonner'

export type CreateTestMutationVariables = {
  draft: CreateTestScheduleDraft
  action: ApiTestAction
}

export function formatTestMutationError(error: unknown): string {
  return formatApiMutationError(error, {
    fallback: 'Failed to create test. Please try again.',
  })
}

export function useCreateTestMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationKey: [...testQueryKeys.all, 'create'],
    mutationFn: async ({ draft, action }: CreateTestMutationVariables) => {
      const payload = mapCreateTestScheduleDraftToPayload(draft, action)
      const { data } = await testService.createTest(payload)
      return { action, apiResponse: data }
    },
    onSuccess: ({ action, apiResponse }) => {
      const fallbackCopy =
        action === 'draft' ? 'Test saved as draft.' : 'Test scheduled successfully.'
      toast.success(resolveApiSuccessMessage(apiResponse, fallbackCopy))
      void queryClient.invalidateQueries({ queryKey: testQueryKeys.all })
      navigate('/test-management', { replace: true })
    },
  })
}
