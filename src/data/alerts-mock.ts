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
  location: string
  state: 'online' | 'warning' | 'offline'
  battery: number
  network: '3G' | '4G' | '5G' | 'N/A'
  signal: string
  lastTest: string
}

export const remoteDevices: RemoteDevice[] = [
  { id: 'rd-1', name: 'PortHarcourt-Central-01', location: 'port-harcourt', state: 'online',  battery: 87, network: '4G',  signal: '-72 dBm', lastTest: '5 min ago' },
  { id: 'rd-2', name: 'Abuja-Central-02',        location: 'abuja',         state: 'online',  battery: 92, network: '4G',  signal: '-65 dBm', lastTest: '3 min ago' },
  { id: 'rd-3', name: 'Kano-east-01',            location: 'ikeja',         state: 'warning', battery: 12, network: '5G',  signal: '-78 dBm', lastTest: '3 min ago' },
  { id: 'rd-4', name: 'Lagos-West-03',           location: 'ikeja',         state: 'offline', battery: 0,  network: 'N/A', signal: 'N/A',     lastTest: '3 min ago' },
  { id: 'rd-5', name: 'Abuja-Central-02',        location: 'abuja',         state: 'online',  battery: 92, network: '4G',  signal: '-65 dBm', lastTest: '3 min ago' },
  { id: 'rd-6', name: 'Lagos-West-03',           location: 'ikeja',         state: 'offline', battery: 0,  network: 'N/A', signal: 'N/A',     lastTest: '3 min ago' },
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
