import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { deviceService } from '@/services/device.service'

export function useDeregisterDeviceMutation(accessToken: string | null, routeDeviceId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (reason: string) => {
      if (!accessToken?.length || !routeDeviceId.trim().length) {
        throw new Error('Not signed in or missing device.')
      }
      const trimmedReason = reason.trim()
      if (!trimmedReason.length) {
        throw new Error('Please provide a reason for unregistering this device.')
      }
      const { data } = await deviceService.deregisterDevice(routeDeviceId, trimmedReason)
      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Device unregistered.'))
      void queryClient.invalidateQueries({ queryKey: deviceQueryKeys.all })
      navigate('/device-management')
    },
  })
}
