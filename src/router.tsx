import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TestManagementPage from '@/pages/test-management/TestManagementPage'
import AlertsPage from '@/pages/alerts/AlertsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import RemoteDeviceControlPage from '@/pages/remote-device-control/RemoteDeviceControlPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import LogoutPage from '@/pages/auth/LogoutPage'
import SignInPage from '@/pages/auth/SignInPage'
import OtpPage from '@/pages/auth/OtpPage'

export const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/test-management', element: <TestManagementPage /> },
      { path: '/alerts', element: <AlertsPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/remote-device-control', element: <RemoteDeviceControlPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/logout', element: <LogoutPage /> },
    ],
  },
  {
    path: '/auth/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/auth/verify',
    element: <OtpPage />,
  },
])
