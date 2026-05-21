import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'

export default function LogoutPage() {
  const navigate = useNavigate()
  const didLogout = useRef(false)
  const { accessToken, refreshToken, clearTokens } = useAuthStore()

  useEffect(() => {
    if (didLogout.current) return
    didLogout.current = true

    async function performLogout() {
      if (accessToken && refreshToken) {
        try {
          await authService.logout({ refresh_token: refreshToken })
        } catch {
          // Proceed with local cleanup even if API call fails
        }
      }

      clearTokens()
      navigate('/auth/sign-in', { replace: true })
    }

    performLogout()
  }, [navigate, accessToken, refreshToken, clearTokens])

  return (
    <div className="flex min-h-screen items-center justify-center bg-vess-grey-100">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-vess-grey-50 p-8">
        <div className="size-8 animate-spin rounded-full border-2 border-vess-grey-300 border-t-vess-primary-500" />
        <p className="text-[14px] text-vess-grey-800">Signing out…</p>
      </div>
    </div>
  )
}
