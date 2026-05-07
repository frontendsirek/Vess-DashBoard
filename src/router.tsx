import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TestManagementPage from '@/pages/test-management/TestManagementPage'
import SignInPage from '@/pages/auth/SignInPage'
import OtpPage from '@/pages/auth/OtpPage'

export const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/test-management', element: <TestManagementPage /> },
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
