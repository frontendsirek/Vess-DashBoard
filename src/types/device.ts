/** Device lifecycle / connectivity status returned by `/device/api/v1/devices/` APIs. */
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'STALE' | 'TESTING' | 'DEGRADED'

/** Device API returns mixed scalar metadata (strings, numbers, booleans) on list/search payloads. */
export type ApiDeviceMetadata = Record<string, string | number | boolean | null | undefined>

export type ApiDeviceHardware = {
  manufacturer?: string
  model?: string
  os?: string
  os_version?: string
  app_version?: string
}

export type ApiDeviceHealthMetrics = {
  battery?: {
    level?: number
    is_charging?: boolean
  }
  storage?: {
    available_mb?: number
    used_mb?: number
  }
  memory?: {
    available_mb?: number
    used_mb?: number
  }
}

export type ApiDeviceNetwork = {
  operator?: string
  type?: string
  signal_strength?: number
  msisdn?: string
  status?: DeviceStatus
}

export type ApiDeviceAlertThresholds = {
  battery_threshold?: number
  offline_duration_minutes?: number
}

export type ApiDeviceTestSummary = {
  total_tests: number
  successful_tests: number
  failed_tests: number
  avg_network_speed_mbps: number | null
  success_rate: number
}

/** Legacy list/detail health block — list responses may still include this shape. */
export type ApiDeviceHealthSummary = {
  battery_level?: number
  storage_available_mb?: number
  app_version?: string
}

/** Legacy statistics block on list responses. */
export type ApiDeviceStatistics = {
  total_tests: number
  success_rate: number
}

/** GET `/device/api/v1/devices/stats/` fleet KPI payload. */
export type ApiDeviceStatsByStatus = {
  online: number
  offline: number
  stale: number
  degraded: number
  testing: number
}

export type ApiDeviceStats = {
  total: number
  active: number
  inactive: number
  by_status: ApiDeviceStatsByStatus
  warning_count: number
}

export type ApiDeviceLog = {
  id: string
  level: string
  message: string
  context?: Record<string, unknown> | null
  timestamp: string
  created_at?: string
}

export type ApiDeviceLogsParams = {
  page?: number
  page_size?: number
  /** DEBUG, INFO, WARNING, ERROR, CRITICAL */
  level?: string
}

/** Paginated device logs (`GET .../devices/:deviceId/logs/`). */
export type ApiDeviceLogsPage = {
  count: number
  page: number
  page_size: number
  results: ApiDeviceLog[]
}

export type ApiDeviceTestsParams = {
  page?: number
  page_size?: number
}

/** Paginated device test history (`GET .../devices/:deviceId/tests/`). */
export type ApiDeviceTestsPage = {
  count: number
  page: number
  page_size: number
  results: unknown[]
}

/** Response body for GET `/devices/:deviceId/` (structured device detail contract). */
export type ApiDeviceDetail = {
  id: string
  owner_id?: string
  device_id: string
  device_name: string
  location: string
  physical_address?: string
  latitude: number
  longitude: number
  status: DeviceStatus
  last_heartbeat: string | null
  last_heartbeat_ago_seconds: number | null
  msisdn?: string
  imei?: string
  device_group?: string
  tags?: string[]
  hardware?: ApiDeviceHardware | null
  health_metrics?: ApiDeviceHealthMetrics | null
  network?: ApiDeviceNetwork | null
  alert_thresholds?: ApiDeviceAlertThresholds | null
  test_summary?: ApiDeviceTestSummary | null
  is_active?: boolean
  created_at: string
  updated_at?: string | null
}

export type ApiDevice = {
  /** Server UUID — list responses may omit; detail responses include it */
  id?: string
  device_id: string
  device_name: string
  location: string
  latitude: number
  longitude: number
  status: DeviceStatus
  is_active?: boolean
  metadata?: ApiDeviceMetadata
  created_at?: string
  updated_at?: string | null
  last_heartbeat: string | null
  last_heartbeat_ago_seconds: number | null
  health?: ApiDeviceHealthSummary | null
  recent_tests?: unknown[] | null
  statistics?: ApiDeviceStatistics | null
}

export type ListDevicesParams = {
  status?: DeviceStatus
  location?: string
  search?: string
  operator?: string
  group?: string
  created_after?: string
  created_before?: string
  ordering?: string
  page?: number
  page_size?: number
}

/** Dashboard-managed device fields (no `metadata` — that is device/mobile-reported). */
export type DashboardDeviceConfigurationPayload = {
  device_name: string
  location: string
  latitude: number
  longitude: number
  msisdn?: string
  imei?: string
  device_group?: string
  tags?: string[]
  alert_battery_threshold?: number
  alert_offline_duration_minutes?: number
}

export type RegisterDevicePayload = DashboardDeviceConfigurationPayload & {
  device_id: string
}

export type UpdateDevicePayload = Partial<DashboardDeviceConfigurationPayload> & {
  device_id?: string
}

export type HeartbeatPayload = {
  battery_level: number
  storage_available_mb: number
  network_type: string
  signal_strength: number
  latitude: number
  longitude: number
  app_version: string
}

export type DeviceExportFormat = 'json' | 'csv'

export type ExportDevicesParams = {
  format?: DeviceExportFormat
  status?: DeviceStatus
  search?: string
  ordering?: string
}

export type ApiDeviceExportRecord = {
  id: string
  device_id: string
  device_name: string
  status: DeviceStatus
  location?: string
}

export type ApiDevicesExportPage = {
  count: number
  results: ApiDeviceExportRecord[]
}

export type ExportDeviceTestHistoryParams = {
  format?: DeviceExportFormat
  page?: number
  page_size?: number
}

export type ApiDeviceDiagnosticsResult = {
  device_id: string
  status: string
  issues: string[]
  heartbeat_age_seconds: number | null
  battery_level: number | null
  signal_strength: number | null
  error_logs_last_24h: number | null
  checked_at: string
}

export type ApiRemoteControlSession = {
  session_id: string
  device_id: string
  started_by: string
  started_at: string
  expires_at: string
  status: string
  reason?: string
  channel: string
}

export type ApiRemoteControlSessionResponse = {
  active: boolean
  session: ApiRemoteControlSession | null
}

export type StartRemoteControlSessionPayload = {
  expires_in_minutes: number
  reason: string
}

export type SendRemoteCommandPayload = {
  command: string
  args?: Record<string, unknown>
}

export type ApiRemoteCommandResponse = {
  queued: boolean
  session_id: string
  command: {
    command_id: string
    command: string
    args?: Record<string, unknown>
    issued_at: string
    issued_by: string
  }
}
