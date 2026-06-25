import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogoutMutation } from '@/hooks/auth/use-logout-mutation'
import { useAuthStore } from '@/stores/auth-store'

export default function LogoutPage() {
  const navigate = useNavigate()
  const didLogout = useRef(false)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const clearTokens = useAuthStore((s) => s.clearTokens)
  const logoutMutation = useLogoutMutation()

  useEffect(() => {
    if (didLogout.current) return
    didLogout.current = true

    if (refreshToken) {
      logoutMutation.mutate(refreshToken)
      return
    }

    clearTokens()
    navigate('/auth/sign-in', { replace: true })
    // Run once on mount; refreshToken read at first paint after persist hydrate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional single logout attempt
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-vess-grey-100">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-vess-grey-50 p-8">
        <div className="size-8 animate-spin rounded-full border-2 border-vess-grey-300 border-t-vess-primary-500" />
        <p className="text-[12px] text-vess-grey-800">Signing out…</p>
      </div>
    </div>
  )
}
