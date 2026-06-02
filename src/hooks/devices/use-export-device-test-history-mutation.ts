import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { downloadExportFile } from '@/lib/download-export-file'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { deviceService } from '@/services/device.service'
import type { DeviceExportFormat } from '@/types/device'

type ExportDeviceTestHistoryVariables = {
  deviceId: string
  format?: DeviceExportFormat
  page?: number
  page_size?: number
}

export function useExportDeviceTestHistoryMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: async ({
      deviceId,
      format = 'json',
      page = 1,
      page_size = 200,
    }: ExportDeviceTestHistoryVariables) => {
      if (!accessToken?.length || !deviceId.trim().length) {
        throw new Error('Not signed in or missing device.')
      }

      const { data } = await deviceService.exportDeviceTestHistory(deviceId.trim(), {
        format,
        page,
        page_size,
      })

      return { data, deviceId: deviceId.trim(), format }
    },
    onSuccess: ({ data, deviceId, format }) => {
      downloadExportFile(data, `device-${deviceId}-test-history`, format)
      toast.success(resolveApiSuccessMessage(data, 'Test history exported.'))
    },
  })
}
