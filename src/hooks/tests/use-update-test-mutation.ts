import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { throwIfApiEnvelopeFailed } from '@/lib/assert-api-envelope'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { UpdateTestPayload } from '@/types/test'

export function useUpdateTestMutation(accessToken: string | null, testId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: UpdateTestPayload) => {
      if (!accessToken?.length || !testId.trim().length) {
        throw new Error('Not signed in or missing test.')
      }
      const { data } = await testService.updateTest(testId, payload)
      throwIfApiEnvelopeFailed(data, 'Could not update test.')
      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Test updated.'))
      void queryClient.invalidateQueries({ queryKey: testQueryKeys.all })
      navigate(`/test-management/${encodeURIComponent(testId)}`)
    },
    onError: (error) => {
      toast.error(
        formatApiMutationError(error, {
          fallback: 'Failed to update test. Please try again.',
        }),
      )
    },
  })
}
