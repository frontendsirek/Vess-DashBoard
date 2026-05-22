/** Device lifecycle / connectivity status returned by `/device/api/v1/devices/` APIs. */
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'STALE' | 'TESTING' | 'DEGRADED'

/** Device API returns mixed scalar metadata (strings, numbers, booleans). */
export type ApiDeviceMetadata = Record<string, string | number | boolean | null | undefined>

/**
 * Known metadata keys on GET `/devices/:deviceId/` (fleet device detail contract).
 * Index signature allows additional server fields without losing typing on documented keys.
 */
export type ApiDeviceDetailMetadata = {
  model?: string
  app_version?: string
  approved_at?: string
  manufacturer?: string
  network_type?: string
  phone_number?: string
  battery_level?: number
  battery_percent?: number | string
  android_version?: string
  approval_status?: string
  organization_id?: string | null
  signal_strength?: number
  storage_available_mb?: number
  memory_available_mb?: number
  memory_percent?: number
  available_memory_percent?: number
  registered_by_user_id?: string
  registration_request_id?: string
  site_slug?: string
  tier?: string
  group?: string
  device_type?: string
  network_operator?: string
  carrier?: string
  sim_operator?: string
} & {
  [key: string]: string | number | boolean | null | undefined
}

export type ApiDeviceHealthSummary = {
  battery_level?: number
  storage_available_mb?: number
  app_version?: string
}

export type ApiDeviceStatistics = {
  total_tests: number
  success_rate: number
}

/** Response body for GET `/devices/:deviceId/` matching the VeSS fleet device detail payload */
export type ApiDeviceDetail = {
  id: string
  device_id: string
  device_name: string
  location: string
  latitude: number
  longitude: number
  status: DeviceStatus
  last_heartbeat: string | null
  last_heartbeat_ago_seconds: number | null
  created_at: string
  metadata: ApiDeviceDetailMetadata
  health: ApiDeviceHealthSummary | null
  recent_tests: unknown[] | null
  statistics: ApiDeviceStatistics | null
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
  metadata: ApiDeviceMetadata
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
  created_after?: string
  created_before?: string
  ordering?: string
  page?: number
  page_size?: number
}

export type RegisterDevicePayload = {
  device_id: string
  device_name: string
  location: string
  latitude: number
  longitude: number
  metadata?: Record<string, string>
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
