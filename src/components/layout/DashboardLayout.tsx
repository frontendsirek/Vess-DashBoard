import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { applyThemeHslVariables, resolveInitialColorMode } from '@/lib/theme'
import { useAuthStore } from '@/stores/auth-store'

export function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken)

  useEffect(() => {
    applyThemeHslVariables(resolveInitialColorMode())
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return (
    <div className="flex min-h-screen w-full items-start bg-vess-grey-100 text-vess-grey-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
