import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { normalizeDeviceListResults } from '@/lib/normalize-device-list-response'
import { deviceService } from '@/services/device.service'
import type { ApiDevice } from '@/types/device'

export function useDevicesSearchQuery(accessToken: string | null, searchQuery: string, enabled: boolean) {
  const hasQuery = searchQuery.trim().length > 0
  return useQuery({
    queryKey: deviceQueryKeys.search(accessToken, searchQuery),
    enabled: !!accessToken && enabled && hasQuery,
    queryFn: async (): Promise<ApiDevice[]> => {
      const { data } = await deviceService.searchDevices(searchQuery.trim())
      return normalizeDeviceListResults(data)
    },
  })
}
