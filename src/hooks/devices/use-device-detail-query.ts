import { useQuery } from '@tanstack/react-query'
import type { DeviceRecord } from '@/data/device-management'
import { mapApiDeviceToDeviceRecord } from '@/lib/api-device-mapper'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'

/** Fetches one device when `queryEnabled` (e.g. not using a mocked device record). */
export function useDeviceDetailQuery(accessToken: string | null, deviceId: string, queryEnabled: boolean) {
  return useQuery({
    queryKey: deviceQueryKeys.detail(accessToken, deviceId),
    enabled: !!(accessToken && deviceId && queryEnabled),
    queryFn: async (): Promise<DeviceRecord> => {
      const { data } = await deviceService.getDevice(deviceId)
      return mapApiDeviceToDeviceRecord(data)
    },
    retry: false,
  })
}
