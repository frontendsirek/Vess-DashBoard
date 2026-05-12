import type { CreateTestScheduleDraft } from '@/types/create-test'

export type TestType = 'Call' | 'SMS' | 'Data'
export type TestStatus = 'Running' | 'Scheduled' | 'Completed'

export type RunningTest = {
  id: string
  name: string
  progress: number
  elapsed: string
  duration: string
  signal: string
  network: '3G' | '4G' | '5G'
  tone: 'navy' | 'red'
}

export const runningTests: RunningTest[] = [
  {
    id: 'rt-1',
    name: 'Lagos \u2192 Abuja',
    progress: 80,
    elapsed: '48s',
    duration: '60s',
    signal: '-68 dBm',
    network: '4G',
    tone: 'navy',
  },
  {
    id: 'rt-2',
    name: 'Kano Data Speed',
    progress: 30,
    elapsed: '15s',
    duration: '50s',
    signal: '-89 dBm',
    network: '3G',
    tone: 'red',
  },
  {
    id: 'rt-3',
    name: 'Accra Throughput',
    progress: 95,
    elapsed: '28s',
    duration: '30s',
    signal: '-61 dBm',
    network: '5G',
    tone: 'navy',
  },
]

export type DeviceStatus = {
  id: string
  name: string
  location: string
  network: '3G' | '4G' | '5G' | '---'
  uptimePercent: number
  state: 'online' | 'testing' | 'offline'
}

export const deviceStatuses: DeviceStatus[] = [
  {
    id: 'd-1',
    name: 'Lagos-Central-01',
    location: '48s / Lagos, Nigeria',
    network: '4G',
    uptimePercent: 87,
    state: 'online',
  },
  {
    id: 'd-2',
    name: 'Abuja-Central-01',
    location: 'Abuja, Nigeria',
    network: '5G',
    uptimePercent: 92,
    state: 'online',
  },
  {
    id: 'd-3',
    name: 'Port-Harcourt-02',
    location: 'Port Harcourt, Nigeria',
    network: '---',
    uptimePercent: 45,
    state: 'offline',
  },
  {
    id: 'd-4',
    name: 'Kano-01',
    location: 'Kano, Nigeria',
    network: '3G',
    uptimePercent: 12,
    state: 'testing',
  },
  {
    id: 'd-5',
    name: 'Ibadan-01',
    location: 'Ibadan, Nigeria',
    network: '4G',
    uptimePercent: 78,
    state: 'online',
  },
]

export type AlertTone = 'red' | 'amber' | 'navy'

export type RecentAlert = {
  id: string
  tone: AlertTone
  title: string
  body: string
  timestamp: string
  ack?: boolean
}

export const recentAlerts: RecentAlert[] = [
  {
    id: 'a-1',
    tone: 'red',
    title: 'Device Offline',
    body: 'DEV-003 Port-Harcourt-02 has been offline for 12 hours.',
    timestamp: '2 minutes ago',
  },
  {
    id: 'a-2',
    tone: 'amber',
    title: 'Low Battery',
    body: 'DEV-004 Kano-01 battery at 12%. Device may go offline soon.',
    timestamp: '15 minutes ago',
  },
  {
    id: 'a-3',
    tone: 'navy',
    title: 'Test Completed',
    body: 'TST-0846 Abuja SMS Latency completed with 99.1% success rate.',
    timestamp: '1 hour ago',
    ack: true,
  },
]

export type NetworkOverviewMetric = {
  id: string
  value: string
  label: string
  tone: 'navy' | 'green' | 'amber' | 'grey' | 'red'
}

export const networkOverview: NetworkOverviewMetric[] = [
  { id: 'no-1', value: '0', label: 'Total Devices', tone: 'navy' },
  { id: 'no-2', value: '0', label: 'Total Tests', tone: 'green' },
  { id: 'no-3', value: '99.8%', label: 'Availability', tone: 'amber' },
  { id: 'no-4', value: '24h', label: 'Uptime', tone: 'grey' },
  { id: 'no-5', value: '0', label: 'Error Rate', tone: 'red' },
]

export type SuccessRatePoint = {
  time: string
  sms: number
  call: number
}

export const successRateSeries: SuccessRatePoint[] = [
  { time: '00:00', sms: 3.6, call: 4.1 },
  { time: '02:00', sms: 4.0, call: 4.4 },
  { time: '04:00', sms: 5.1, call: 5.8 },
  { time: '06:00', sms: 4.4, call: 5.3 },
  { time: '08:00', sms: 3.0, call: 3.4 },
  { time: '10:00', sms: 2.9, call: 4.2 },
  { time: '12:00', sms: 3.6, call: 4.0 },
  { time: '14:00', sms: 4.5, call: 5.6 },
  { time: '16:00', sms: 3.8, call: 5.1 },
  { time: '18:00', sms: 3.5, call: 4.8 },
  { time: '20:00', sms: 4.6, call: 5.7 },
  { time: '22:00', sms: 5.0, call: 6.1 },
  { time: '24:00', sms: 4.2, call: 5.0 },
]

export type TestRecord = {
  id: string
  name: string
  type: TestType
  source: string
  destination: string
  lastRun: string
  status: TestStatus
}

export const tests: TestRecord[] = [
  {
    id: 't-1',
    name: 'Lagos-Abuja Call Test',
    type: 'Call',
    source: 'Lagos-1',
    destination: 'Abuja-1',
    lastRun: '2m ago',
    status: 'Running',
  },
  {
    id: 't-2',
    name: 'Port SMS Delivery',
    type: 'SMS',
    source: '+234812345678',
    destination: 'Port Harcourt-1',
    lastRun: '14m ago',
    status: 'Scheduled',
  },
  {
    id: 't-3',
    name: 'Kano Data Speed Test',
    type: 'Data',
    source: 'Abuja-1',
    destination: 'Kano-1',
    lastRun: '5m ago',
    status: 'Running',
  },
  {
    id: 't-4',
    name: 'Ibadan-Osun Data Test',
    type: 'Data',
    source: 'Ibadan-1',
    destination: 'Osun-1',
    lastRun: '1h ago',
    status: 'Completed',
  },
  {
    id: 't-5',
    name: 'Enugu-Cross River Call Test',
    type: 'Call',
    source: 'Enugu-1',
    destination: 'Cross River-1',
    lastRun: '22m ago',
    status: 'Scheduled',
  },
  {
    id: 't-6',
    name: 'Emergency SMS Alert',
    type: 'SMS',
    source: '+234812345678',
    destination: 'Sokoto-1',
    lastRun: '20m ago',
    status: 'Completed',
  },
  {
    id: 't-7',
    name: 'Kano Data Speed Test',
    type: 'Data',
    source: 'Abuja-1',
    destination: 'Kano-1',
    lastRun: '23m ago',
    status: 'Running',
  },
  {
    id: 't-8',
    name: 'Emergency SMS Alert',
    type: 'SMS',
    source: '+234812345678',
    destination: 'Sokoto-1',
    lastRun: '2m ago',
    status: 'Completed',
  },
]

export type TestDetailExecutionRow = {
  id: string
  success: boolean
  timestamp: string
  detail: string
}

export type TestDetailRecord = {
  id: string
  name: string
  status: TestStatus
  progressPercent?: number
  lastExecutionLabel: string
  successRate: string
  avgDuration: string
  totalRuns: string
  configRows: { label: string; value: string }[]
  /** Scheduled view: duplicate label row per Figma (second column placeholder). */
  configRowsExtra?: { label: string; value: string; hideValue?: boolean }
  executions: TestDetailExecutionRow[]
  executionsEmptyMessage?: string
}

export const testDetailById: Record<string, TestDetailRecord> = {
  't-1': {
    id: 't-1',
    name: 'Lagos-Abuja Call Test',
    status: 'Running',
    progressPercent: 93,
    lastExecutionLabel: '13/03/2026, 16:45:23',
    successRate: '98.5%',
    avgDuration: '45.3s',
    totalRuns: '5',
    configRows: [
      { label: 'Type', value: 'Call' },
      { label: 'Description', value: 'N/A' },
      { label: 'Source Device', value: 'Lagos-1' },
      { label: 'Destination', value: 'Lagos-1' },
      { label: 'Schedule', value: 'Recurring (hourly)' },
      { label: 'Call Duration', value: '60s' },
      { label: 'Retry Attempts', value: '2' },
      { label: 'Execution Window', value: 'Business hours only' },
    ],
    executions: [
      {
        id: 'ex-1',
        success: true,
        timestamp: '13/03/2026, 18:15:23',
        detail: 'Success (42s) | Signal: -65dBm',
      },
      {
        id: 'ex-2',
        success: true,
        timestamp: '13/03/2026, 17:45:23',
        detail: 'Success (48s) | Signal: -72dBm',
      },
      {
        id: 'ex-3',
        success: false,
        timestamp: '13/03/2026, 17:15:23',
        detail: 'Failed (Timeout) | Signal: -89dBm',
      },
      {
        id: 'ex-4',
        success: true,
        timestamp: '13/03/2026, 16:45:23',
        detail: 'Success (41s) | Signal: -68dBm',
      },
    ],
  },
  't-2': {
    id: 't-2',
    name: 'Lagos-Abuja Call Test',
    status: 'Scheduled',
    lastExecutionLabel: 'N/A',
    successRate: '0%',
    avgDuration: '0s',
    totalRuns: '0',
    configRows: [
      { label: 'Type', value: 'Call' },
      { label: 'Description', value: 'N/A' },
      { label: 'Source Device', value: 'Lagos-1' },
      { label: 'Destination', value: 'Lagos-1' },
      { label: 'Schedule', value: 'One-Time' },
      { label: 'Call Duration', value: '60s' },
      { label: 'Retry Attempts', value: '2' },
    ],
    configRowsExtra: { label: 'Call Duration', value: '60s', hideValue: true },
    executions: [],
    executionsEmptyMessage: 'No executions yet',
  },
  't-4': {
    id: 't-4',
    name: 'Lagos-Abuja Call Test',
    status: 'Completed',
    lastExecutionLabel: '13/03/2026, 16:45:23',
    successRate: '100.0%',
    avgDuration: '45.3s',
    totalRuns: '10',
    configRows: [
      { label: 'Type', value: 'Call' },
      { label: 'Description', value: 'N/A' },
      { label: 'Source Device', value: 'Lagos-1' },
      { label: 'Destination', value: 'Lagos-1' },
      { label: 'Schedule', value: 'Recurring (Daily)' },
      { label: 'Call Duration', value: '60s' },
      { label: 'Retry Attempts', value: '2' },
      { label: 'Execution Window', value: 'Business hours only' },
    ],
    executions: [
      {
        id: 'ex-c1',
        success: true,
        timestamp: '13/03/2026, 18:15:23',
        detail: 'Success (42s) | Signal: -65dBm',
      },
    ],
  },
}

export function buildTestDetailFromWizard(draft: CreateTestScheduleDraft): TestDetailRecord {
  const scheduleSummary =
    draft.scheduleKind === 'recurring'
      ? `Recurring (${draft.frequency.toLowerCase()})`
      : draft.immediate
        ? 'One-Time (immediate)'
        : `One-Time (${draft.scheduledDateTime || 'scheduled'})`

  return {
    id: 'wizard',
    name: draft.testName || 'New Test',
    status: 'Scheduled',
    lastExecutionLabel: 'N/A',
    successRate: '0%',
    avgDuration: '0s',
    totalRuns: '0',
    configRows: [
      { label: 'Type', value: draft.testType ?? 'Call' },
      { label: 'Description', value: draft.description.trim() || 'N/A' },
      { label: 'Source Device', value: draft.sourceDevice || '—' },
      { label: 'Destination', value: draft.destinationDevice || '—' },
      { label: 'Schedule', value: scheduleSummary },
      { label: 'Call Duration', value: `${draft.callDurationSeconds}s` },
      { label: 'Retry Attempts', value: draft.retryOnFailure.replace(/\D/g, '') || '0' },
    ],
    executions: [],
    executionsEmptyMessage: 'No executions yet',
  }
}

export function resolveTestDetailRecord(testId: string): TestDetailRecord | undefined {
  return testDetailById[testId]
}

export function buildFallbackTestDetail(record: TestRecord): TestDetailRecord {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    progressPercent: record.status === 'Running' ? 50 : undefined,
    lastExecutionLabel: record.status === 'Scheduled' ? 'N/A' : record.lastRun,
    successRate: record.status === 'Completed' ? '—' : '0%',
    avgDuration: '—',
    totalRuns: '—',
    configRows: [
      { label: 'Type', value: record.type },
      { label: 'Description', value: 'N/A' },
      { label: 'Source Device', value: record.source },
      { label: 'Destination', value: record.destination },
      { label: 'Schedule', value: '—' },
      { label: 'Call Duration', value: '—' },
      { label: 'Retry Attempts', value: '—' },
    ],
    executions: [],
    executionsEmptyMessage: 'No executions yet',
  }
}
