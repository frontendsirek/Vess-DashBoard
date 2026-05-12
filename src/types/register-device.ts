/** Register device flow — mock draft until API exists (Figma 708:22775). */

export type RegisterDeviceDraft = {
  deviceName: string
  locationMode: 'detected' | 'manual'
  locationManual: string
  deviceGroup: string
  /** E.164, e.g. +2348012345678 */
  msisdnE164: string
  tags: string
  lowBatteryPercent: number
  offlineMinutes: number
}

/* ── Registration Request types (from device-service collection) ── */

export type RegistrationRequestStatus = 'pending' | 'approved' | 'expired' | 'revoked'

export type RegistrationRequest = {
  registration_id: string
  phone_number: string
  reference: string
  status: RegistrationRequestStatus
  sync_url: string | null
  created_at: string
  updated_at: string
}

export type CreateRegistrationRequestPayload = {
  phone_number: string
  reference: string
}

export type BulkRegistrationRequestPayload = {
  registrations: CreateRegistrationRequestPayload[]
}

export type BulkRegistrationResponse = {
  count: number
  results: RegistrationRequest[]
}

export type SyncCompletePayload = {
  device_id: string
  device_name: string
  location: string
  latitude: number
  longitude: number
  metadata?: Record<string, string>
}

export type SyncCompleteResponse = {
  device_id: string
  api_key: string
}
