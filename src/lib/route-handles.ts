import type { AppRouteHandle } from '@/types/route-handle'

export const ROUTE_HANDLES = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Real-time network health',
  },
  testManagement: {
    title: 'Test Management',
    subtitle: 'Test configuration & results',
  },
  deviceManagementList: {
    title: 'Device Management',
    subtitle: 'Fleet health, registration & remote access',
  },
  deviceManagementDetail: {
    title: 'Device Management',
    subtitle: 'Device fleet management',
  },
  realTimeMonitoring: {
    title: 'Real-time Monitoring',
    subtitle: 'Active test execution',
  },
  alerts: {
    title: 'Alerts & Notifications',
    subtitle: 'Notifications & alert rules',
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Reports & KPI trends',
  },
  remoteDeviceControl: {
    title: 'Remote Device Control',
    subtitle: 'Remote device access & control',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Configure notifications, thresholds, and system preferences',
  },
  logout: {
    hideTopbar: true,
  },
} as const satisfies Record<string, AppRouteHandle>
