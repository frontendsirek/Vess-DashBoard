import { useMutation } from '@tanstack/react-query'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceDiagnosticsResult } from '@/types/device'

export function useRunDeviceDiagnosticsMutation(accessToken: string | null, deviceId: string) {
  return useMutation({
    mutationFn: async (): Promise<ApiDeviceDiagnosticsResult> => {
      if (!accessToken?.length || !deviceId.trim().length) {
        throw new Error('Not signed in or missing device.')
      }

      const { data } = await deviceService.runDeviceDiagnostics(deviceId.trim())
      return data
    },
  })
}
