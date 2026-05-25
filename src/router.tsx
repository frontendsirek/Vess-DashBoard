import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ROUTE_HANDLES } from '@/lib/route-handles'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TestManagementPage from '@/pages/test-management/TestManagementPage'
import CreateTestConfigurePage from '@/pages/test-management/CreateTestConfigurePage'
import CreateTestSchedulePage from '@/pages/test-management/CreateTestSchedulePage'
import EditTestConfigurePage from '@/pages/test-management/EditTestConfigurePage'
import EditTestSchedulePage from '@/pages/test-management/EditTestSchedulePage'
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
      {
        path: '/dashboard',
        element: <DashboardPage />,
        handle: ROUTE_HANDLES.dashboard,
      },
      {
        path: '/test-management/new/configure',
        element: <CreateTestConfigurePage />,
        handle: ROUTE_HANDLES.testManagement,
      },
      {
        path: '/test-management/new/schedule',
        element: <CreateTestSchedulePage />,
        handle: ROUTE_HANDLES.testManagement,
      },
      {
        path: '/test-management/:testId/edit/configure',
        element: <EditTestConfigurePage />,
        handle: ROUTE_HANDLES.testManagement,
      },
      {
        path: '/test-management/:testId/edit/schedule',
        element: <EditTestSchedulePage />,
        handle: ROUTE_HANDLES.testManagement,
      },
      {
        path: '/test-management/:testId',
        element: <TestDetailPage />,
        handle: ROUTE_HANDLES.testManagement,
      },
      {
        path: '/test-management',
        element: <TestManagementPage />,
        handle: ROUTE_HANDLES.testManagement,
      },
      {
        path: '/device-management/register',
        element: <RegisterDevicePage />,
        handle: ROUTE_HANDLES.deviceManagementDetail,
      },
      {
        path: '/device-management/:deviceId/test-history',
        element: <DeviceTestHistoryPage />,
        handle: ROUTE_HANDLES.deviceManagementDetail,
      },
      {
        path: '/device-management/:deviceId/logs',
        element: <DeviceLogsPage />,
        handle: ROUTE_HANDLES.deviceManagementDetail,
      },
      {
        path: '/device-management/:deviceId/edit',
        element: <DeviceEditPage />,
        handle: ROUTE_HANDLES.deviceManagementDetail,
      },
      {
        path: '/device-management/:deviceId',
        element: <DeviceDetailPage />,
        handle: ROUTE_HANDLES.deviceManagementDetail,
      },
      {
        path: '/device-management',
        element: <DeviceManagementPage />,
        handle: ROUTE_HANDLES.deviceManagementList,
      },
      {
        path: '/real-time-monitoring',
        element: <RealTimeMonitoringPage />,
        handle: ROUTE_HANDLES.realTimeMonitoring,
      },
      {
        path: '/alerts',
        element: <AlertsPage />,
        handle: ROUTE_HANDLES.alerts,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
        handle: ROUTE_HANDLES.reports,
      },
      {
        path: '/remote-device-control',
        element: <RemoteDeviceControlPage />,
        handle: ROUTE_HANDLES.remoteDeviceControl,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
        handle: ROUTE_HANDLES.settings,
      },
      {
        path: '/logout',
        element: <LogoutPage />,
        handle: ROUTE_HANDLES.logout,
      },
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
