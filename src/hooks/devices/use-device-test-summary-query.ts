import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceTestSummary } from '@/types/device'

export function useDeviceTestSummaryQuery(
  accessToken: string | null,
  deviceId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: deviceQueryKeys.testSummary(accessToken, deviceId),
    enabled: !!(accessToken && deviceId && enabled),
    queryFn: async (): Promise<ApiDeviceTestSummary> => {
      const { data } = await deviceService.getDeviceTestSummary(deviceId)
      return data
    },
    retry: false,
  })
}
