export type AlertSeverityApi = 'critical' | 'warning' | 'info'

export type AlertStatus = 'active' | 'acknowledged' | 'resolved'

export type AlertRule = {
  id: string
  name: string
  description: string
  severity: AlertSeverityApi
  enabled: boolean
  condition: string
  createdAt: string
}

export type AlertHistoryEntry = {
  id: string
  severity: AlertSeverityApi
  title: string
  body: string
  deviceId: string
  deviceName: string
  status: AlertStatus
  triggeredAt: string
  resolvedAt: string | null
}
