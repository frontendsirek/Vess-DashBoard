import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { deviceService } from '@/services/device.service'
import type {
  ApiRemoteControlSession,
  ApiRemoteControlSessionResponse,
  SendRemoteCommandPayload,
} from '@/types/device'

const DEFAULT_SESSION_MINUTES = 30
const DEFAULT_SESSION_REASON = 'Dashboard remote control session'

async function ensureActiveRemoteSession(deviceId: string): Promise<ApiRemoteControlSessionResponse> {
  const { data: existing } = await deviceService.getRemoteControlSession(deviceId)
  if (existing.active && existing.session) {
    return existing
  }

  const { data: started } = await deviceService.startRemoteControlSession(deviceId, {
    expires_in_minutes: DEFAULT_SESSION_MINUTES,
    reason: DEFAULT_SESSION_REASON,
  })

  return started
}

export function useEnsureRemoteControlSessionQuery(
  accessToken: string | null,
  deviceId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: deviceQueryKeys.remoteSession(accessToken, deviceId ?? ''),
    enabled: !!(accessToken && deviceId?.trim() && enabled),
    queryFn: async () => {
      const response = await ensureActiveRemoteSession(deviceId!.trim())
      if (!response.active || !response.session) {
        throw new Error('Could not start remote control session.')
      }
      return response
    },
    retry: false,
    staleTime: 0,
  })
}

export function useEndRemoteControlSessionMutation(
  accessToken: string | null,
  deviceId: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!accessToken?.length || !deviceId?.trim() || !sessionId.trim().length) {
        throw new Error('Missing session or device.')
      }

      const { data } = await deviceService.endRemoteControlSession(deviceId.trim(), sessionId.trim())
      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Remote control session ended.'))
      void queryClient.invalidateQueries({
        queryKey: deviceQueryKeys.remoteSession(accessToken, deviceId ?? ''),
      })
    },
  })
}

export function useSendRemoteCommandMutation(
  accessToken: string | null,
  deviceId: string | undefined,
  session: ApiRemoteControlSession | null | undefined,
) {
  return useMutation({
    mutationFn: async (payload: SendRemoteCommandPayload) => {
      if (!accessToken?.length || !deviceId?.trim() || !session?.session_id) {
        throw new Error('No active remote control session.')
      }

      const { data } = await deviceService.sendRemoteCommand(
        deviceId.trim(),
        session.session_id,
        payload,
      )

      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Command queued.'))
    },
  })
}
