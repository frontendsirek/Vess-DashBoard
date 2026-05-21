import { useQuery } from '@tanstack/react-query'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'
import type { ListProbesParams } from '@/types/test'

export function useTestsListQuery(accessToken: string | null, params: ListProbesParams) {
  return useQuery({
    queryKey: testQueryKeys.list(accessToken, params),
    enabled: !!accessToken,
    queryFn: async () => {
      const { data } = await testService.listProbes(params)
      if (!data.isSuccess) {
        const msg = data.error?.description ?? data.message ?? 'Could not load tests.'
        throw new Error(msg)
      }
      return data
    },
  })
}
