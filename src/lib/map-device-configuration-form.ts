import { type DeviceEditDefaults, formatDeviceCoordinatesDisplay } from '@/data/device-management'
import type { DeviceConfigurationFormValues } from '@/schemas/device/device-configuration-form.schema'
import type { RegisterDevicePayload } from '@/types/device'

export function deriveRegisterDeviceId(deviceName: string): string {
  const slug =
    deviceName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
  const base = slug.length > 0 ? slug : 'device'
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `${Date.now()}`
  return `${base}-${suffix}`
}

function compactMetadata(meta: Record<string, string>): Record<string, string> | undefined {
  const entries = Object.entries(meta).filter(([, v]) => v.trim().length > 0)
  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

/** Maps validated form values + browser GPS coordinates to REST payload. Coordinates come from "Use detected location". */
export function mapRegisterFormToPayload(
  values: DeviceConfigurationFormValues,
  coords: { latitude: number; longitude: number },
): RegisterDevicePayload {
  const device_id = deriveRegisterDeviceId(values.deviceName)
  const device_name = values.deviceName.trim()
  const coordinateLabel = formatDeviceCoordinatesDisplay(coords.latitude, coords.longitude)
  const location =
    values.locationMode === 'detected' ? coordinateLabel : values.locationManual.trim()

  const metadata: Record<string, string> = {}
  if (values.deviceGroup.trim()) metadata.group = values.deviceGroup.trim()
  if (values.tags.trim()) metadata.tags = values.tags.trim()
  metadata.low_battery_percent = String(values.lowBatteryPercent)
  metadata.offline_minutes = String(values.offlineMinutes)
  if (values.msisdn.trim()) metadata.phone_number = values.msisdn.trim()

  return {
    device_id,
    device_name,
    location,
    latitude: coords.latitude,
    longitude: coords.longitude,
    metadata: compactMetadata(metadata),
  }
}

export function deviceEditDefaultsToFormValues(defaults: DeviceEditDefaults): DeviceConfigurationFormValues {
  return {
    deviceName: defaults.name,
    locationMode: defaults.locationMode,
    locationManual: defaults.locationManual,
    deviceGroup: defaults.deviceGroup,
    msisdn: defaults.msisdn ?? '',
    tags: defaults.tags,
    lowBatteryPercent: defaults.lowBatteryPercent,
    offlineMinutes: defaults.offlineMinutes,
  }
}

function metadataPatchFromEditForm(values: DeviceConfigurationFormValues): Record<string, string> {
  const metadata: Record<string, string> = {}
  if (values.deviceGroup.trim()) metadata.group = values.deviceGroup.trim()
  if (values.tags.trim()) metadata.tags = values.tags.trim()
  metadata.low_battery_percent = String(values.lowBatteryPercent)
  metadata.offline_minutes = String(values.offlineMinutes)
  if (values.msisdn.trim()) metadata.phone_number = values.msisdn.trim()
  return metadata
}

/** Optional `metadata` body for `updateDevice` when at least one key is non-empty. */
export function buildOptionalDeviceMetadataFromForm(
  values: DeviceConfigurationFormValues,
): Record<string, string> | undefined {
  return compactMetadata(metadataPatchFromEditForm(values))
}
