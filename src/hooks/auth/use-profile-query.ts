import { useQuery } from '@tanstack/react-query'
import { authQueryKeys } from '@/lib/auth-query-keys'
import { parseApiUserProfile } from '@/lib/parse-api-user-profile'
import { authService } from '@/services/auth.service'
import type { ApiUser } from '@/types/user'
import { useAuthStore } from '@/stores/auth-store'

export function useProfileQuery() {
  const accessToken = useAuthStore((s) => s.accessToken)

  return useQuery({
    queryKey: authQueryKeys.profile(accessToken),
    enabled: !!accessToken,
    queryFn: async (): Promise<ApiUser> => {
      const { data } = await authService.getProfile()
      const profile = parseApiUserProfile(data)
      if (!profile) {
        throw new Error('Could not load profile.')
      }
      return profile
    },
    staleTime: 5 * 60 * 1000,
  })
}
