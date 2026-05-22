import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceDetail } from '@/types/device'

/** Raw GET `/devices/:deviceId/` body for the detail page (no legacy `DeviceRecord` mapping). */
export function useDeviceDetailQuery(accessToken: string | null, deviceId: string, queryEnabled: boolean) {
  return useQuery({
    queryKey: deviceQueryKeys.detail(accessToken, deviceId),
    enabled: !!(accessToken && deviceId && queryEnabled),
    queryFn: async (): Promise<ApiDeviceDetail> => {
      const { data } = await deviceService.getDevice(deviceId)
      return data
    },
    retry: false,
  })
}
