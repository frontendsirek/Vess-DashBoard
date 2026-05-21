import { apiClient } from '@/lib/axios-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  BulkRegistrationRequestPayload,
  BulkRegistrationResponse,
  CreateRegistrationRequestPayload,
  RegistrationRequest,
  SyncCompletePayload,
  SyncCompleteResponse,
} from '@/types/register-device'

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'STALE' | 'TESTING' | 'DEGRADED'

export type ApiDevice = {
  device_id: string
  device_name: string
  location: string
  latitude: number
  longitude: number
  status: DeviceStatus
  is_active: boolean
  metadata: Record<string, string>
  created_at: string
  updated_at: string
  last_heartbeat: string | null
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

const DEVICES_PREFIX = '/device/api/v1/devices'
const REGISTRATION_PREFIX = '/device/api/v1/registration'

export const deviceService = {
  /* ── Health ── */

  health() {
    return apiClient.get('/device/health/')
  },

  /* ── Devices ── */

  listDevices(params?: ListDevicesParams) {
    return apiClient.get<PaginatedResponse<ApiDevice>>(DEVICES_PREFIX + '/', {
      params,
    })
  },

  getDevice(deviceId: string) {
    return apiClient.get<ApiDevice>(`${DEVICES_PREFIX}/${deviceId}/`)
  },

  registerDevice(payload: RegisterDevicePayload) {
    return apiClient.post<{ device_id: string; api_key: string }>(
      DEVICES_PREFIX + '/',
      payload,
    )
  },

  updateDevice(deviceId: string, payload: Partial<RegisterDevicePayload>) {
    return apiClient.put(`${DEVICES_PREFIX}/${deviceId}/`, payload)
  },

  deregisterDevice(deviceId: string, reason: string) {
    return apiClient.delete(`${DEVICES_PREFIX}/${deviceId}/`, {
      data: { reason },
    })
  },

  searchDevices(query: string) {
    return apiClient.get<ApiDevice[]>(`${DEVICES_PREFIX}/search/`, {
      params: { q: query },
    })
  },

  findNearby(lat: number, lng: number, radiusKm: number) {
    return apiClient.get<(ApiDevice & { distance_km: number })[]>(
      `${DEVICES_PREFIX}/nearby/`,
      {
        params: { lat, lng, radius_km: radiusKm },
      },
    )
  },

  /* ── Device Operations (device-side auth via X-API-Key) ── */

  sendHeartbeat(deviceId: string, payload: HeartbeatPayload, apiKey: string) {
    return apiClient.post(`${DEVICES_PREFIX}/${deviceId}/heartbeat/`, payload, {
      headers: { 'X-API-Key': apiKey },
    })
  },

  updateLocation(
    deviceId: string,
    payload: { latitude: number; longitude: number; location: string },
    apiKey: string,
  ) {
    return apiClient.put(`${DEVICES_PREFIX}/${deviceId}/location/`, payload, {
      headers: { 'X-API-Key': apiKey },
    })
  },

  /* ── Registration Requests ── */

  createRegistrationRequest(payload: CreateRegistrationRequestPayload) {
    return apiClient.post<RegistrationRequest>(
      `${REGISTRATION_PREFIX}/requests/`,
      payload,
    )
  },

  createBulkRegistrationRequests(payload: BulkRegistrationRequestPayload) {
    return apiClient.post<BulkRegistrationResponse>(
      `${REGISTRATION_PREFIX}/requests/bulk/`,
      payload,
    )
  },

  getRegistrationRequest(requestId: string) {
    return apiClient.get<RegistrationRequest>(
      `${REGISTRATION_PREFIX}/requests/${requestId}/`,
    )
  },

  revokeRegistrationRequest(requestId: string) {
    return apiClient.post(
      `${REGISTRATION_PREFIX}/requests/${requestId}/revoke/`,
      null,
    )
  },

  regenerateSyncLink(requestId: string) {
    return apiClient.post<RegistrationRequest>(
      `${REGISTRATION_PREFIX}/requests/${requestId}/regenerate/`,
      null,
    )
  },

  /* ── Sync Link (device-side, no JWT) ── */

  validateSyncUrl(syncToken: string) {
    return apiClient.get<RegistrationRequest>(
      `${REGISTRATION_PREFIX}/sync/${syncToken}/`,
    )
  },

  completeSyncRegistration(syncToken: string, payload: SyncCompletePayload) {
    return apiClient.post<SyncCompleteResponse>(
      `${REGISTRATION_PREFIX}/sync/${syncToken}/`,
      payload,
    )
  },
}
