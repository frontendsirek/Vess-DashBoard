import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDevice, ListDevicesParams } from '@/types/device'
import type { PaginatedResponse } from '@/types/api'

export function useDevicesListQuery(accessToken: string | null, params: ListDevicesParams, enabled: boolean) {
  return useQuery({
    queryKey: deviceQueryKeys.list(accessToken, params),
    enabled: !!accessToken && enabled,
    queryFn: async (): Promise<PaginatedResponse<ApiDevice>> => {
      const { data } = await deviceService.listDevices(params)
      return data
    },
  })
}
