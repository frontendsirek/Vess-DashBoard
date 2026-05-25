import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authQueryKeys } from '@/lib/auth-query-keys'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'

export function useLogoutMutation() {
  const navigate = useNavigate()
  const clearTokens = useAuthStore((s) => s.clearTokens)

  return useMutation({
    mutationKey: authQueryKeys.logout(),
    meta: { suppressErrorToast: true },
    mutationFn: async (refreshToken: string) => {
      await authService.logout({ refresh_token: refreshToken })
    },
    onSettled: () => {
      clearTokens()
      navigate('/auth/sign-in', { replace: true })
    },
  })
}
