import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { envelopeErrorMessage, throwIfApiEnvelopeError } from '@/lib/assert-api-envelope'
import { parseTokenPairFromAuthEnvelope } from '@/lib/api-auth-errors'
import { authQueryKeys } from '@/lib/auth-query-keys'
import { authService } from '@/services/auth.service'
import type { LoginPayload } from '@/types/user'
import { useAuthStore } from '@/stores/auth-store'

const LOGIN_FAILURE_MESSAGE = 'Invalid email or password.'

type LoginResult =
  | { type: 'otp_required' }
  | { type: 'authenticated'; access: string; refresh: string }

export function useLoginMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationKey: authQueryKeys.login(),
    meta: { errorFallback: LOGIN_FAILURE_MESSAGE },
    mutationFn: async (payload: LoginPayload): Promise<LoginResult> => {
      const { data: envelope } = await authService.login(payload)
      throwIfApiEnvelopeError(envelope, LOGIN_FAILURE_MESSAGE)

      // Check if login requires OTP verification
      const data = (envelope as Record<string, unknown>).data as Record<string, unknown> | undefined
      const requiresOtp =
        data?.requires_otp === true ||
        data?.otp_required === true ||
        (envelope as Record<string, unknown>).requires_otp === true

      if (requiresOtp) {
        const store = useAuthStore.getState()
        store.setPendingEmail(payload.email)
        store.setPendingOtp(
          (data?.otp_for_testing as string) ?? null,
          (data?.challenge_token as string) ?? null,
        )
        return { type: 'otp_required' }
      }

      // Direct token response (fallback)
      const tokenPair = parseTokenPairFromAuthEnvelope(envelope)
      if (!tokenPair) {
        throw new Error(envelopeErrorMessage(envelope, LOGIN_FAILURE_MESSAGE))
      }

      return { type: 'authenticated', ...tokenPair }
    },
    onSuccess: (result) => {
      if (result.type === 'authenticated') {
        const store = useAuthStore.getState()
        store.setTokens(result.access, result.refresh)
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/auth/verify', { replace: true })
      }
    },
  })
}
