import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { envelopeErrorMessage, throwIfApiEnvelopeError } from '@/lib/assert-api-envelope'
import { parseTokenPairFromAuthEnvelope } from '@/lib/api-auth-errors'
import { authQueryKeys } from '@/lib/auth-query-keys'
import { authService } from '@/services/auth.service'
import type { LoginPayload } from '@/types/user'
import { useAuthStore } from '@/stores/auth-store'

const LOGIN_FAILURE_MESSAGE = 'Invalid email or password.'

export function useLoginMutation() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  return useMutation({
    mutationKey: authQueryKeys.login(),
    meta: { errorFallback: LOGIN_FAILURE_MESSAGE },
    mutationFn: async (payload: LoginPayload) => {
      const { data: envelope } = await authService.login(payload)
      throwIfApiEnvelopeError(envelope, LOGIN_FAILURE_MESSAGE)

      const tokenPair = parseTokenPairFromAuthEnvelope(envelope)
      if (!tokenPair) {
        throw new Error(envelopeErrorMessage(envelope, LOGIN_FAILURE_MESSAGE))
      }

      return tokenPair
    },
    onSuccess: (tokenPair) => {
      setTokens(tokenPair.access, tokenPair.refresh)
      navigate('/dashboard', { replace: true })
    },
  })
}
