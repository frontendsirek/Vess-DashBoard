import { useQuery } from '@tanstack/react-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceStats } from '@/types/device'

export type DevicesKpiSummary = {
  total: number
  online: number
  offline: number
  lowBattery: number
}

function mapApiDeviceStatsToKpiSummary(stats: ApiDeviceStats): DevicesKpiSummary {
  return {
    total: stats.total,
    online: stats.active,
    offline: stats.inactive,
    lowBattery: stats.warning_count,
  }
}

export function useDevicesKpiQuery(accessToken: string | null) {
  return useQuery({
    queryKey: deviceQueryKeys.stats(accessToken),
    enabled: !!accessToken,
    queryFn: async (): Promise<DevicesKpiSummary> => {
      const { data } = await deviceService.getDeviceStats()
      return mapApiDeviceStatsToKpiSummary(data)
    },
  })
}
