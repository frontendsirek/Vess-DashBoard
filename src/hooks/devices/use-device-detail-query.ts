import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDevice, ApiDeviceDetail } from '@/types/device'
import type { PaginatedResponse } from '@/types/api'

/**
 * Searches the device list query cache for a matching device_id
 * to supplement fields (like `imei`) that the detail endpoint omits.
 */
function findDeviceInListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  deviceId: string,
): ApiDevice | undefined {
  const listQueries = queryClient.getQueriesData<PaginatedResponse<ApiDevice>>({
    queryKey: deviceQueryKeys.all,
  })
  for (const [, data] of listQueries) {
    if (!data || !('results' in data)) continue
    const match = data.results.find((d) => d.device_id === deviceId)
    if (match) return match
  }
  return undefined
}

/** Raw GET `/devices/:deviceId/` body for the detail page (no legacy `DeviceRecord` mapping). */
export function useDeviceDetailQuery(accessToken: string | null, deviceId: string, queryEnabled: boolean) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: deviceQueryKeys.detail(accessToken, deviceId),
    enabled: !!(accessToken && deviceId && queryEnabled),
    queryFn: async (): Promise<ApiDeviceDetail> => {
      const { data } = await deviceService.getDevice(deviceId)

      // Backend detail endpoint may omit `imei` — hydrate from list cache if available
      if (!data.imei) {
        const cached = findDeviceInListCache(queryClient, deviceId)
        if (cached?.imei) {
          data.imei = cached.imei
        }
      }

      return data
    },
    retry: false,
  })
}
