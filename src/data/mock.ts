import type { CreateTestScheduleDraft } from '@/types/create-test'

export type TestType = 'Call' | 'SMS' | 'Data'
/** Aligns with probe `deliveryStatus` from API (display labels). */
export type TestStatus =
  | 'Draft'
  | 'Ready'
  | 'Running'
  | 'Cancel requested'
  | 'Canceled'

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

export function buildTestDetailFromWizard(draft: CreateTestScheduleDraft): TestDetailRecord {
  const scheduleSummary =
    draft.scheduleKind === 'recurring'
      ? `Recurring (${draft.frequency.toLowerCase()})`
      : draft.immediate
        ? 'One-Time (immediate)'
        : `One-Time (${draft.scheduledDateTime || 'scheduled'})`

  const typeLabel = draft.testType ?? 'Call'

  const configRows: { label: string; value: string }[] = [
    { label: 'Type', value: typeLabel },
    { label: 'Description', value: draft.description.trim() || 'N/A' },
    { label: 'Source Device', value: draft.sourceDevice || '—' },
  ]

  if (typeLabel !== 'Data') {
    configRows.push({ label: 'Destination', value: draft.destinationDevice || '—' })
  }

  if (typeLabel === 'Call') {
    configRows.push({ label: 'Call Duration', value: `${draft.callDurationSeconds}s` })
  }

  if (typeLabel === 'SMS') {
    configRows.push({ label: 'Message Text', value: draft.messageText.trim() || '—' })
  }

  if (typeLabel === 'Data') {
    const methodLabel = draft.dataTestMethod === 'ping' ? 'Ping' : 'Target URL'
    const targetLabel = draft.dataTestMethod === 'ping' ? 'Host / IP' : 'Endpoint URL'
    configRows.push(
      { label: 'Test Method', value: methodLabel },
      { label: targetLabel, value: draft.dataTargetValue.trim() || '—' },
      { label: 'Payload (KB)', value: String(draft.payloadSizeKb) },
    )
  }

  configRows.push(
    { label: 'Schedule', value: scheduleSummary },
    { label: 'Retry Attempts', value: draft.retryOnFailure.replace(/\D/g, '') || '0' },
  )

  return {
    id: 'wizard',
    name: draft.testName || 'New Test',
    status: 'Draft',
    lastExecutionLabel: 'N/A',
    successRate: '0%',
    avgDuration: '0s',
    totalRuns: '0',
    configRows,
    executions: [],
    executionsEmptyMessage: 'No executions yet',
  }
}
