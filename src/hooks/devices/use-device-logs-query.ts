import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceLogsPage, ApiDeviceLogsParams } from '@/types/device'

export function useDeviceLogsQuery(
  accessToken: string | null,
  deviceId: string,
  params: ApiDeviceLogsParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: deviceQueryKeys.logs(accessToken, deviceId, params),
    enabled: !!(accessToken && deviceId && enabled),
    queryFn: async (): Promise<ApiDeviceLogsPage> => {
      const { data } = await deviceService.getDeviceLogs(deviceId, params)
      return data
    },
    retry: false,
  })
}
