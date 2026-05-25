import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { throwIfApiEnvelopeError } from '@/lib/assert-api-envelope'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'

export function useDeleteTestMutation(accessToken: string | null, testId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (!accessToken?.length || !testId.trim().length) {
        throw new Error('Not signed in or missing test.')
      }
      const { data } = await testService.deleteTest(testId)
      throwIfApiEnvelopeError(data, 'Could not delete test.')
      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Test deleted.'))
      void queryClient.invalidateQueries({ queryKey: testQueryKeys.all })
      navigate('/test-management')
    },
    onError: (error) => {
      toast.error(
        formatApiMutationError(error, {
          fallback: 'Failed to delete test. Please try again.',
        }),
      )
    },
  })
}
