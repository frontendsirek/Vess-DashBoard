import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { deviceService } from '@/services/device.service'

/** Backend requires a short reason body on DELETE `/devices/:id/` */
const DEREGISTER_REASON_DEFAULT =
  'Unregister requested from device management dashboard'

export function useDeregisterDeviceMutation(accessToken: string | null, routeDeviceId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (!accessToken?.length || !routeDeviceId.trim().length) {
        throw new Error('Not signed in or missing device.')
      }
      await deviceService.deregisterDevice(routeDeviceId, DEREGISTER_REASON_DEFAULT)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceQueryKeys.all })
      navigate('/device-management')
    },
  })
}
