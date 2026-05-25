import { useQuery } from '@tanstack/react-query'
import { throwIfApiEnvelopeFailed } from '@/lib/assert-api-envelope'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { ListProbesParams } from '@/types/test'

export function useTestsListQuery(accessToken: string | null, params: ListProbesParams) {
  return useQuery({
    queryKey: testQueryKeys.list(accessToken, params),
    enabled: !!accessToken,
    queryFn: async () => {
      const { data } = await testService.listProbes(params)
      throwIfApiEnvelopeFailed(data, 'Could not load tests.')
      return data
    },
  })
}
