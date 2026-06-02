import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { downloadExportFile } from '@/lib/download-export-file'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { deviceService } from '@/services/device.service'
import type { DeviceExportFormat } from '@/types/device'

type ExportDeviceDataVariables = {
  deviceId: string
  format?: DeviceExportFormat
}

export function useExportDeviceDataMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: async ({ deviceId, format = 'json' }: ExportDeviceDataVariables) => {
      if (!accessToken?.length || !deviceId.trim().length) {
        throw new Error('Not signed in or missing device.')
      }

      const { data } = await deviceService.exportDevices({
        format,
        search: deviceId.trim(),
      })

      return { data, deviceId: deviceId.trim(), format }
    },
    onSuccess: ({ data, deviceId, format }) => {
      downloadExportFile(data, `device-${deviceId}-export`, format)
      toast.success(resolveApiSuccessMessage(data, 'Device data exported.'))
    },
  })
}
