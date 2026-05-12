import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TestManagementPage from '@/pages/test-management/TestManagementPage'
import CreateTestConfigurePage from '@/pages/test-management/CreateTestConfigurePage'
import CreateTestSchedulePage from '@/pages/test-management/CreateTestSchedulePage'
import TestDetailPage from '@/pages/test-management/TestDetailPage'
import AlertsPage from '@/pages/alerts/AlertsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import RealTimeMonitoringPage from '@/pages/real-time-monitoring/RealTimeMonitoringPage'
import RemoteDeviceControlPage from '@/pages/remote-device-control/RemoteDeviceControlPage'
import DeviceManagementPage from '@/pages/device-management/DeviceManagementPage'
import RegisterDevicePage from '@/pages/device-management/RegisterDevicePage'
import DeviceDetailPage from '@/pages/device-management/DeviceDetailPage'
import DeviceTestHistoryPage from '@/pages/device-management/DeviceTestHistoryPage'
import DeviceLogsPage from '@/pages/device-management/DeviceLogsPage'
import DeviceEditPage from '@/pages/device-management/DeviceEditPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import LogoutPage from '@/pages/auth/LogoutPage'
import SignInPage from '@/pages/auth/SignInPage'
import OtpPage from '@/pages/auth/OtpPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/sign-in" replace />,
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/test-management/new/configure', element: <CreateTestConfigurePage /> },
      { path: '/test-management/new/schedule', element: <CreateTestSchedulePage /> },
      { path: '/test-management/:testId', element: <TestDetailPage /> },
      { path: '/test-management', element: <TestManagementPage /> },
      { path: '/device-management/register', element: <RegisterDevicePage /> },
      { path: '/device-management/:deviceId/test-history', element: <DeviceTestHistoryPage /> },
      { path: '/device-management/:deviceId/logs', element: <DeviceLogsPage /> },
      { path: '/device-management/:deviceId/edit', element: <DeviceEditPage /> },
      { path: '/device-management/:deviceId', element: <DeviceDetailPage /> },
      { path: '/device-management', element: <DeviceManagementPage /> },
      { path: '/real-time-monitoring', element: <RealTimeMonitoringPage /> },
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
