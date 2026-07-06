import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authQueryKeys } from '@/lib/auth-query-keys'

const RESEND_UNAVAILABLE_MESSAGE =
  'Could not resend verification code. Please sign in again or restart registration.'

/** No resend-otp endpoint in auth-service; surface a clear message instead of a broken login call. */
export function useResendOtpMutation() {
  return useMutation({
    mutationKey: authQueryKeys.resendOtp(),
    meta: { suppressErrorToast: true },
    mutationFn: async (email: string) => {
      void email
      throw new Error(RESEND_UNAVAILABLE_MESSAGE)
    },
    onError: () => {
      toast.error(RESEND_UNAVAILABLE_MESSAGE)
    },
  })
}
