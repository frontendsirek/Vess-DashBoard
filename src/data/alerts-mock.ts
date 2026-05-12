export type AlertSeverity = 'critical' | 'warning' | 'info'

export type ActiveAlert = {
  id: string
  severity: AlertSeverity
  title: string
  body: string
  timestamp: string
  ack?: boolean
}

export const stormDevices = [
  'Lagos-1', 'Lagos-2', 'Lagos-3',
  'Abuja-1', 'Abuja-2', 'Abuja-Central',
  'Port-Harcourt-1', 'Port-Harcourt-2', 'Kano-1',
  'Kano-2', 'Ibadan-1', 'Enugu-1',
]

export const activeAlerts: ActiveAlert[] = [
  {
    id: 'al-1',
    severity: 'critical',
    title: 'Device Offline',
    body: 'DEV-003 Port-Harcourt-02 has been offline for 12 hours.',
    timestamp: '2 minutes ago',
  },
  {
    id: 'al-2',
    severity: 'warning',
    title: 'Low Battery',
    body: 'DEV-004 Kano-01 battery at 12%. Device may go offline soon.',
    timestamp: '15 minutes ago',
  },
  {
    id: 'al-3',
    severity: 'info',
    title: 'Test Completed',
    body: 'TST-0846 Abuja SMS Latency completed with 99.1% success rate.',
    timestamp: '1 hour ago',
    ack: true,
  },
  {
    id: 'al-4',
    severity: 'info',
    title: 'Firmware Update',
    body: 'Firmware v2.4.1 available for 3 devices.',
    timestamp: '1 hour ago',
    ack: true,
  },
]

export type ReportCard = {
  id: string
  title: string
  description: string
  icon: 'doc' | 'device' | 'compare' | 'chart'
  tone: 'navy' | 'green' | 'amber' | 'red'
  meta: string
}

export const standardReports: ReportCard[] = [
  {
    id: 'r-1',
    title: 'Test Execution Report',
    description: 'Detailed test results and statistics',
    icon: 'doc',
    tone: 'green',
    meta: 'Estimated time: 45 seconds',
  },
  {
    id: 'r-2',
    title: 'Network Performance Summary',
    description: 'Network quality, success rates and breakdowns',
    icon: 'chart',
    tone: 'navy',
    meta: 'Estimated time: 60 seconds',
  },
  {
    id: 'r-3',
    title: 'Device Health Report',
    description: 'Battery, storage, connectivity, and uptime',
    icon: 'device',
    tone: 'amber',
    meta: 'Estimated time: 30 seconds',
  },
  {
    id: 'r-4',
    title: 'Comparative Analysis',
    description: 'Compare time periods and locations',
    icon: 'compare',
    tone: 'red',
    meta: 'Estimated time: 50 seconds',
  },
]

export type RemoteDevice = {
  id: string
  name: string
  /** Hardware model (Figma 464:14114 remote header). */
  model: string
  location: string
  state: 'online' | 'warning' | 'offline'
  battery: number
  network: '3G' | '4G' | '5G' | 'N/A'
  signal: string
  lastTest: string
}

export const remoteDevices: RemoteDevice[] = [
  { id: 'rd-1', name: 'PortHarcourt-Central-01', model: 'Samsung Galaxy A52', location: 'port-harcourt', state: 'online',  battery: 87, network: '4G',  signal: '-72 dBm', lastTest: '5 min ago' },
  { id: 'rd-2', name: 'Abuja-Central-02',        model: 'Samsung Galaxy A52', location: 'abuja',         state: 'online',  battery: 92, network: '4G',  signal: '-65 dBm', lastTest: '3 min ago' },
  { id: 'rd-3', name: 'Kano-east-01',            model: 'Samsung Galaxy A34', location: 'ikeja',         state: 'warning', battery: 12, network: '5G',  signal: '-78 dBm', lastTest: '3 min ago' },
  { id: 'rd-4', name: 'Lagos-West-03',           model: 'Samsung Galaxy A52', location: 'ikeja',         state: 'offline', battery: 0,  network: 'N/A', signal: 'N/A',     lastTest: '3 min ago' },
  { id: 'rd-5', name: 'Abuja-Central-02',        model: 'Samsung Galaxy A52', location: 'abuja',         state: 'online',  battery: 92, network: '4G',  signal: '-65 dBm', lastTest: '3 min ago' },
  { id: 'rd-6', name: 'Lagos-West-03',           model: 'Samsung Galaxy A52', location: 'ikeja',         state: 'offline', battery: 0,  network: 'N/A', signal: 'N/A',     lastTest: '3 min ago' },
]

export type AlertRuleMock = {
  id: string
  name: string
  description: string
  severity: AlertSeverity
  enabled: boolean
  condition: string
  lastTriggered: string
}

export const alertRules: AlertRuleMock[] = [
  {
    id: 'rule-1',
    name: 'Device Offline',
    description: 'Triggers when a device has not sent a heartbeat for more than 5 minutes',
    severity: 'critical',
    enabled: true,
    condition: 'heartbeat_age > 5min',
    lastTriggered: '2 minutes ago',
  },
  {
    id: 'rule-2',
    name: 'Low Battery Warning',
    description: 'Alerts when device battery drops below 15%',
    severity: 'warning',
    enabled: true,
    condition: 'battery_level < 15%',
    lastTriggered: '15 minutes ago',
  },
  {
    id: 'rule-3',
    name: 'Test Failure Rate',
    description: 'Triggers when test failure rate exceeds 20% in a 1-hour window',
    severity: 'warning',
    enabled: true,
    condition: 'failure_rate > 20% within 1h',
    lastTriggered: '1 hour ago',
  },
  {
    id: 'rule-4',
    name: 'Signal Degradation',
    description: 'Alerts when signal strength falls below -100 dBm',
    severity: 'info',
    enabled: false,
    condition: 'signal_strength < -100 dBm',
    lastTriggered: '3 days ago',
  },
  {
    id: 'rule-5',
    name: 'Storage Full',
    description: 'Triggers when available storage drops below 500 MB',
    severity: 'warning',
    enabled: true,
    condition: 'storage_available < 500MB',
    lastTriggered: 'Never',
  },
  {
    id: 'rule-6',
    name: 'Firmware Update Available',
    description: 'Notifies when a new firmware version is available for devices',
    severity: 'info',
    enabled: true,
    condition: 'firmware_version < latest',
    lastTriggered: '1 hour ago',
  },
]

export type AlertHistoryMock = {
  id: string
  severity: AlertSeverity
  title: string
  body: string
  deviceName: string
  status: 'active' | 'acknowledged' | 'resolved'
  triggeredAt: string
  resolvedAt: string | null
}

export const alertHistory: AlertHistoryMock[] = [
  {
    id: 'ah-1',
    severity: 'critical',
    title: 'Device Offline',
    body: 'DEV-003 Port-Harcourt-02 has been offline for 12 hours.',
    deviceName: 'Port-Harcourt-02',
    status: 'resolved',
    triggeredAt: 'May 12, 2026 08:15',
    resolvedAt: 'May 12, 2026 09:30',
  },
  {
    id: 'ah-2',
    severity: 'warning',
    title: 'Low Battery',
    body: 'DEV-004 Kano-Central-04 battery at 12%.',
    deviceName: 'Kano-Central-04',
    status: 'acknowledged',
    triggeredAt: 'May 12, 2026 07:45',
    resolvedAt: null,
  },
  {
    id: 'ah-3',
    severity: 'critical',
    title: 'Multiple Device Offline',
    body: '5 devices went offline simultaneously in Lagos region.',
    deviceName: 'Lagos-West-03',
    status: 'resolved',
    triggeredAt: 'May 11, 2026 22:10',
    resolvedAt: 'May 11, 2026 23:45',
  },
  {
    id: 'ah-4',
    severity: 'info',
    title: 'Test Completed',
    body: 'TST-0846 Abuja SMS Latency completed with 99.1% success rate.',
    deviceName: 'Abuja-Central-02',
    status: 'resolved',
    triggeredAt: 'May 11, 2026 18:30',
    resolvedAt: 'May 11, 2026 18:30',
  },
  {
    id: 'ah-5',
    severity: 'warning',
    title: 'Signal Degradation',
    body: 'DEV-006 Enugu-West-06 signal dropped to -98 dBm.',
    deviceName: 'Enugu-West-06',
    status: 'acknowledged',
    triggeredAt: 'May 11, 2026 14:20',
    resolvedAt: null,
  },
  {
    id: 'ah-6',
    severity: 'info',
    title: 'Firmware Update',
    body: 'Firmware v2.4.1 successfully applied to 3 devices.',
    deviceName: 'PortHarcourt-Central-01',
    status: 'resolved',
    triggeredAt: 'May 11, 2026 10:00',
    resolvedAt: 'May 11, 2026 10:15',
  },
  {
    id: 'ah-7',
    severity: 'critical',
    title: 'Network Outage',
    body: 'Complete network connectivity loss detected in Port Harcourt region.',
    deviceName: 'Port-Harcourt-02',
    status: 'resolved',
    triggeredAt: 'May 10, 2026 15:30',
    resolvedAt: 'May 10, 2026 17:00',
  },
  {
    id: 'ah-8',
    severity: 'warning',
    title: 'High Test Failure Rate',
    body: 'Call test failure rate exceeded 25% across Kano devices.',
    deviceName: 'Kano-Central-04',
    status: 'resolved',
    triggeredAt: 'May 10, 2026 11:15',
    resolvedAt: 'May 10, 2026 13:00',
  },
]

export type NotificationPreference = {
  id: string
  label: string
  description: string
  email: boolean
  sms: boolean
  push: boolean
}

export const notificationPreferences: NotificationPreference[] = [
  { id: 'np-1', label: 'Device Offline',        description: 'When a device goes offline',            email: true,  sms: true,  push: true  },
  { id: 'np-2', label: 'Low Battery',           description: 'When battery drops below threshold',    email: true,  sms: false, push: true  },
  { id: 'np-3', label: 'Test Failures',         description: 'When test failure rate exceeds limit',  email: true,  sms: true,  push: true  },
  { id: 'np-4', label: 'Firmware Updates',      description: 'When new firmware is available',        email: true,  sms: false, push: false },
  { id: 'np-5', label: 'Scheduled Reports',     description: 'When scheduled reports are ready',      email: true,  sms: false, push: false },
  { id: 'np-6', label: 'Security Alerts',       description: 'Unusual login or permission changes',   email: true,  sms: true,  push: true  },
]

export type ThresholdSetting = {
  id: string
  label: string
  description: string
  value: number
  unit: string
  min: number
  max: number
}

export const thresholdSettings: ThresholdSetting[] = [
  { id: 'th-1', label: 'Low Battery Threshold',      description: 'Alert when battery drops below this level', value: 15, unit: '%',   min: 5,   max: 50  },
  { id: 'th-2', label: 'Offline Timeout',             description: 'Mark device offline after no heartbeat',    value: 5,  unit: 'min', min: 1,   max: 60  },
  { id: 'th-3', label: 'Signal Strength Threshold',   description: 'Alert when signal falls below this level',  value: -100, unit: 'dBm', min: -120, max: -50 },
  { id: 'th-4', label: 'Storage Warning Threshold',   description: 'Alert when available storage drops below',  value: 500, unit: 'MB', min: 100, max: 2048 },
  { id: 'th-5', label: 'Test Failure Rate Threshold', description: 'Alert when failure rate exceeds this',       value: 20, unit: '%',  min: 5,   max: 50 },
]

export type TeamMember = {
  id: string
  initials: string
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  status: 'Active' | 'Inactive'
  lastLogin: string
}

export const teamMembers: TeamMember[] = [
  { id: 'u-1', initials: 'AO', name: 'Adebayo Okafor',   email: 'admin@vess.io',   role: 'ADMIN',    status: 'Active',   lastLogin: '14 minutes ago' },
  { id: 'u-2', initials: 'BT', name: 'Brianna Thomas',   email: 'brianna@vess.io', role: 'OPERATOR', status: 'Inactive', lastLogin: '2 hours ago' },
  { id: 'u-3', initials: 'CJ', name: 'Carlos Johnson',   email: 'carlos@vess.io',  role: 'OPERATOR', status: 'Active',   lastLogin: '30 minutes ago' },
  { id: 'u-4', initials: 'DK', name: 'Diana Kim',        email: 'diana@vess.io',   role: 'VIEWER',   status: 'Active',   lastLogin: '5 minutes ago' },
  { id: 'u-5', initials: 'EL', name: 'Ethan Lee',        email: 'ethan@vess.io',   role: 'ADMIN',    status: 'Inactive', lastLogin: '1 hour ago' },
  { id: 'u-6', initials: 'FM', name: 'Fiona Martinez',   email: 'fiona@vess.io',   role: 'VIEWER',   status: 'Active',   lastLogin: '5 days ago' },
]
