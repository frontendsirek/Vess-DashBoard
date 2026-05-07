import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { applyThemeHslVariables, resolveInitialColorMode } from '@/lib/theme'

export function DashboardLayout() {
  useEffect(() => {
    applyThemeHslVariables(resolveInitialColorMode())
  }, [])

  return (
    <div className="flex min-h-screen w-full items-start bg-vess-grey-100 text-vess-grey-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
