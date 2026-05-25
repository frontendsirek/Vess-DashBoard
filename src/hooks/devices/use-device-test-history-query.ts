import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceTestsPage, ApiDeviceTestsParams } from '@/types/device'

export function useDeviceTestHistoryQuery(
  accessToken: string | null,
  deviceId: string,
  params: ApiDeviceTestsParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: deviceQueryKeys.testHistory(accessToken, deviceId, params),
    enabled: !!(accessToken && deviceId && enabled),
    queryFn: async (): Promise<ApiDeviceTestsPage> => {
      const { data } = await deviceService.getDeviceTestHistory(deviceId, params)
      return data
    },
    retry: false,
  })
}
