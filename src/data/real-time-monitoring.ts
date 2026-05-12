/** Mock data for Real-time Monitoring (Figma Desktop 78, node 708:25623). */

export type HeatmapMarkerStatus = 'healthy' | 'warning' | 'offline'

export type ActiveExecutionRow = {
  id: string
  title: string
  percent: number
  status: 'ok' | 'error'
  elapsedLabel: string
  signalLabel: string
  warningMessage?: string
}

export type MonitoringAlert = {
  id: string
  severity: 'high' | 'medium'
  title: string
  body: string
  timeAgo: string
}

export type MonitoringDeviceStatusLabel = 'Online' | 'Warning' | 'Offline'

export type MonitoringDevice = {
  id: string
  name: string
  status: 'online' | 'testing' | 'offline'
  /** Grey subtitle under device name (card may say "Warning" while legend uses "Testing"). */
  statusLabel: MonitoringDeviceStatusLabel
  batteryPercent: number
  /** e.g. `-72 dBm` or `N/A` for offline. */
  signalDisplay: string
  lastTestLabel: string
}

export type PerformanceTrendPoint = {
  time: string
  callSuccess: number
  smsDelivery: number
  dataThroughput: number
}

export const monitoringSummary = {
  activeTests: { value: '30', delta: '↑ 4 from baseline', deltaTone: 'green' as const },
  deviceOnline: {
    value: '6 / 8',
    segments: [
      { text: '2 offline', tone: 'red' as const },
      { text: '1 warning', tone: 'secondary' as const },
    ],
  },
  successRate: { value: '96.4%', delta: '▲ 0.3% last hour', deltaTone: 'green' as const },
  openAlerts: { value: '4', delta: '4 need attention', deltaTone: 'red' as const },
}

export const activeExecutionRunningCount = 3

export const activeExecutions: ActiveExecutionRow[] = [
  {
    id: '1',
    title: 'Lagos → Abuja',
    percent: 80,
    status: 'ok',
    elapsedLabel: '123s elapsed / 60s',
    signalLabel: '-68 dBm · 4G',
  },
  {
    id: '2',
    title: 'Kano Data Speed',
    percent: 30,
    status: 'error',
    elapsedLabel: '303s elapsed / 50s',
    signalLabel: '-89 dBm · 3G',
    warningMessage: 'Low signal strength — test may fail',
  },
  {
    id: '3',
    title: 'Accra Throughput',
    percent: 95,
    status: 'ok',
    elapsedLabel: '628s elapsed / 30s',
    signalLabel: '-61 dBm · 5G',
  },
]

export const heatmapMarkers: { id: string; leftPct: number; topPct: number; status: HeatmapMarkerStatus }[] = [
  { id: 'm1', leftPct: 42, topPct: 55, status: 'healthy' },
  { id: 'm2', leftPct: 48, topPct: 48, status: 'warning' },
  { id: 'm3', leftPct: 55, topPct: 52, status: 'offline' },
  { id: 'm4', leftPct: 38, topPct: 62, status: 'healthy' },
  { id: 'm5', leftPct: 52, topPct: 58, status: 'healthy' },
]

export const heatmapPeriodOptions = ['Today', 'This week', 'This month'] as const

export const monitoringAlerts: MonitoringAlert[] = [
  {
    id: 'a1',
    severity: 'high',
    title: 'Device Offline',
    body: 'DEV-003 Port-Harcourt-02 has been offline for 12 hours.',
    timeAgo: '2 minutes ago',
  },
  {
    id: 'a2',
    severity: 'medium',
    title: 'Low Battery',
    body: 'DEV-004 Kano-01 battery at 12%. Device may go offline soon.',
    timeAgo: '15 minutes ago',
  },
  {
    id: 'a3',
    severity: 'medium',
    title: 'High Failure Rate',
    body: 'TST-0311 Ibadan→Lagos Voice success rate dropped to 76.3%.',
    timeAgo: '22 minutes ago',
  },
  {
    id: 'a4',
    severity: 'high',
    title: 'Signal Degradation',
    body: 'DEV-004 Kano-01 signal strength critically low at -89 dBm.',
    timeAgo: '4 minutes ago',
  },
]

export const monitoringDevices: MonitoringDevice[] = [
  {
    id: 'd1',
    name: 'Lagos-Central-01',
    status: 'online',
    statusLabel: 'Online',
    batteryPercent: 87,
    signalDisplay: '-72 dBm',
    lastTestLabel: '5 min ago',
  },
  {
    id: 'd2',
    name: 'Abuja-North-02',
    status: 'online',
    statusLabel: 'Online',
    batteryPercent: 92,
    signalDisplay: '-65 dBm',
    lastTestLabel: '3 min ago',
  },
  {
    id: 'd3',
    name: 'Kano-East-01',
    status: 'testing',
    statusLabel: 'Warning',
    batteryPercent: 12,
    signalDisplay: '-78 dBm',
    lastTestLabel: '10 min ago',
  },
  {
    id: 'd4',
    name: 'Port-Harcourt-02',
    status: 'offline',
    statusLabel: 'Offline',
    batteryPercent: 0,
    signalDisplay: 'N/A',
    lastTestLabel: '12 hours ago',
  },
  {
    id: 'd5',
    name: 'Ibadan-Central-05',
    status: 'online',
    statusLabel: 'Online',
    batteryPercent: 70,
    signalDisplay: '-68 dBm',
    lastTestLabel: '2 min ago',
  },
  {
    id: 'd6',
    name: 'Enugu-West-06',
    status: 'online',
    statusLabel: 'Online',
    batteryPercent: 82,
    signalDisplay: '-75 dBm',
    lastTestLabel: '15 min ago',
  },
]

export const performanceTrendsPeriodOptions = ['Today', 'Last 7 days'] as const

export const performanceTrendsSeries: PerformanceTrendPoint[] = [
  { time: '00:00', callSuccess: 42, smsDelivery: 38, dataThroughput: 48 },
  { time: '04:00', callSuccess: 55, smsDelivery: 52, dataThroughput: 45 },
  { time: '08:00', callSuccess: 68, smsDelivery: 72, dataThroughput: 58 },
  { time: '08:30', callSuccess: 82, smsDelivery: 87, dataThroughput: 80 },
  { time: '12:00', callSuccess: 78, smsDelivery: 81, dataThroughput: 76 },
  { time: '16:00', callSuccess: 88, smsDelivery: 85, dataThroughput: 82 },
  { time: '20:00', callSuccess: 91, smsDelivery: 89, dataThroughput: 86 },
  { time: '24:00', callSuccess: 85, smsDelivery: 83, dataThroughput: 79 },
]
