import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { envelopeErrorMessage, throwIfApiEnvelopeError } from '@/lib/assert-api-envelope'
import { parseTokenPairFromAuthEnvelope } from '@/lib/api-auth-errors'
import { authQueryKeys } from '@/lib/auth-query-keys'
import { authService } from '@/services/auth.service'
import type { VerifyOtpPayload } from '@/types/user'
import { useAuthStore } from '@/stores/auth-store'

const VERIFY_OTP_FAILURE_MESSAGE = 'Invalid verification code.'

export function useVerifyOtpMutation() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const clearPendingEmail = useAuthStore((s) => s.clearPendingEmail)

  return useMutation({
    mutationKey: authQueryKeys.verifyOtp(),
    meta: { errorFallback: VERIFY_OTP_FAILURE_MESSAGE },
    mutationFn: async (payload: VerifyOtpPayload) => {
      const { data: envelope } = await authService.verifyOtp(payload)
      throwIfApiEnvelopeError(envelope, VERIFY_OTP_FAILURE_MESSAGE)

      const tokenPair = parseTokenPairFromAuthEnvelope(envelope)
      if (!tokenPair) {
        throw new Error(envelopeErrorMessage(envelope, VERIFY_OTP_FAILURE_MESSAGE))
      }

      return tokenPair
    },
    onSuccess: (tokenPair) => {
      setTokens(tokenPair.access, tokenPair.refresh)
      clearPendingEmail()
      navigate('/dashboard', { replace: true })
    },
  })
}
