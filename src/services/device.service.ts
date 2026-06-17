import { apiClient } from '@/lib/axios-client'
import type { PaginatedResponse } from '@/types/api'
import type {
  ApiDevice,
  ApiDeviceDetail,
  ApiDeviceDiagnosticsResult,
  ApiDeviceLogsPage,
  ApiDeviceLogsParams,
  ApiDeviceStats,
  ApiDeviceTestSummary,
  ApiDeviceTestsPage,
  ApiDeviceTestsParams,
  ApiDevicesExportPage,
  ApiRemoteCommandResponse,
  ApiRemoteControlSessionResponse,
  ExportDeviceTestHistoryParams,
  ExportDevicesParams,
  HeartbeatPayload,
  ListDevicesParams,
  RegisterDevicePayload,
  SendRemoteCommandPayload,
  StartRemoteControlSessionPayload,
  UpdateDevicePayload,
} from '@/types/device'
import type {
  BulkRegistrationRequestPayload,
  BulkRegistrationResponse,
  CreateRegistrationRequestPayload,
  RegistrationRequest,
  SyncCompletePayload,
  SyncCompleteResponse,
} from '@/types/register-device'

const DEVICES_PREFIX = '/api/v1/devices'
const REGISTRATION_PREFIX = '/api/v1/registration'

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

  getDeviceStats() {
    return apiClient.get<ApiDeviceStats>(`${DEVICES_PREFIX}/stats/`)
  },

  getDevice(deviceId: string) {
    return apiClient.get<ApiDeviceDetail>(`${DEVICES_PREFIX}/${deviceId}/`)
  },

  getDeviceLogs(deviceId: string, params?: ApiDeviceLogsParams) {
    return apiClient.get<ApiDeviceLogsPage>(`${DEVICES_PREFIX}/${deviceId}/logs/`, {
      params,
    })
  },

  getDeviceTestHistory(deviceId: string, params?: ApiDeviceTestsParams) {
    return apiClient.get<ApiDeviceTestsPage>(`${DEVICES_PREFIX}/${deviceId}/tests/`, {
      params,
    })
  },

  getDeviceTestSummary(deviceId: string) {
    return apiClient.get<ApiDeviceTestSummary>(`${DEVICES_PREFIX}/${deviceId}/tests/summary/`)
  },

  exportDevices(params?: ExportDevicesParams) {
    const format = params?.format ?? 'json'
    return apiClient.get<ApiDevicesExportPage | string>(`${DEVICES_PREFIX}/export/`, {
      params,
      responseType: format === 'csv' ? 'text' : 'json',
    })
  },

  runDeviceDiagnostics(deviceId: string) {
    return apiClient.post<ApiDeviceDiagnosticsResult>(`${DEVICES_PREFIX}/${deviceId}/diagnostics/`)
  },

  exportDeviceTestHistory(deviceId: string, params?: ExportDeviceTestHistoryParams) {
    const format = params?.format ?? 'json'
    return apiClient.get<ApiDeviceTestsPage | string>(
      `${DEVICES_PREFIX}/${deviceId}/tests/export/`,
      {
        params,
        responseType: format === 'csv' ? 'text' : 'json',
      },
    )
  },

  getRemoteControlSession(deviceId: string) {
    return apiClient.get<ApiRemoteControlSessionResponse>(
      `${DEVICES_PREFIX}/${deviceId}/remote-control/session/`,
    )
  },

  startRemoteControlSession(deviceId: string, payload: StartRemoteControlSessionPayload) {
    return apiClient.post<ApiRemoteControlSessionResponse>(
      `${DEVICES_PREFIX}/${deviceId}/remote-control/session/`,
      payload,
    )
  },

  sendRemoteCommand(deviceId: string, sessionId: string, payload: SendRemoteCommandPayload) {
    return apiClient.post<ApiRemoteCommandResponse>(
      `${DEVICES_PREFIX}/${deviceId}/remote-control/session/${sessionId}/command/`,
      payload,
    )
  },

  endRemoteControlSession(deviceId: string, sessionId: string) {
    return apiClient.delete(`${DEVICES_PREFIX}/${deviceId}/remote-control/session/`, {
      params: { session_id: sessionId },
    })
  },

  registerDevice(payload: RegisterDevicePayload) {
    return apiClient.post<{ device_id: string; api_key: string }>(
      DEVICES_PREFIX + '/',
      payload,
    )
  },

  updateDevice(deviceId: string, payload: UpdateDevicePayload) {
    return apiClient.put(`${DEVICES_PREFIX}/${deviceId}/`, payload)
  },

  deregisterDevice(deviceId: string, reason: string) {
    return apiClient.delete(`${DEVICES_PREFIX}/${deviceId}/`, {
      data: { reason },
    })
  },

  searchDevices(query: string) {
    return apiClient.get<ApiDevice[] | PaginatedResponse<ApiDevice>>(
      `${DEVICES_PREFIX}/search/`,
      {
        params: { q: query },
      },
    )
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
