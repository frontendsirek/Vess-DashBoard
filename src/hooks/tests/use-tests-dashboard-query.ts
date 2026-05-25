import { useQuery } from '@tanstack/react-query'
import { throwIfApiEnvelopeFailed } from '@/lib/assert-api-envelope'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { TestsDashboardParams } from '@/types/test'

export function useTestsDashboardQuery(accessToken: string | null, params: TestsDashboardParams) {
  return useQuery({
    queryKey: testQueryKeys.dashboard(accessToken, params),
    enabled: !!accessToken,
    queryFn: async () => {
      const { data } = await testService.getTestsDashboard(params)
      throwIfApiEnvelopeFailed(data, 'Could not load test dashboard.')
      return data
    },
  })
}
