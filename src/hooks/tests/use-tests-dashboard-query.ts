import { useQuery } from '@tanstack/react-query'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { TestsDashboardParams } from '@/types/test'

export function useTestsDashboardQuery(accessToken: string | null, params: TestsDashboardParams) {
  return useQuery({
    queryKey: testQueryKeys.dashboard(accessToken, params),
    enabled: !!accessToken,
    queryFn: async () => {
      const { data } = await testService.getTestsDashboard(params)
      if (!data.isSuccess) {
        const msg = data.error?.description ?? data.message ?? 'Could not load test dashboard.'
        throw new Error(msg)
      }
      return data
    },
  })
}
