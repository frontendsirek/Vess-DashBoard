import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'

export type DevicesKpiSummary = {
  total: number
  online: number
  offline: number
}

export function useDevicesKpiQuery(accessToken: string | null) {
  return useQuery({
    queryKey: deviceQueryKeys.kpiCounts(accessToken),
    enabled: !!accessToken,
    queryFn: async (): Promise<DevicesKpiSummary> => {
      const [allRes, onlineRes, offlineRes] = await Promise.all([
        deviceService.listDevices({ page: 1, page_size: 1 }),
        deviceService.listDevices({ page: 1, page_size: 1, status: 'ONLINE' }),
        deviceService.listDevices({ page: 1, page_size: 1, status: 'OFFLINE' }),
      ])
      return {
        total: allRes.data.count,
        online: onlineRes.data.count,
        offline: offlineRes.data.count,
      }
    },
  })
}
