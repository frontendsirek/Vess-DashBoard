import { type DeviceEditDefaults, formatDeviceCoordinatesDisplay } from '@/data/device-management'
import type { DeviceConfigurationFormValues } from '@/schemas/device/device-configuration-form.schema'
import type {
  DashboardDeviceConfigurationPayload,
  RegisterDevicePayload,
  UpdateDevicePayload,
} from '@/types/device'

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

function parseTagsFromForm(tags: string): string[] {
  return tags
    .split(/[,;]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

/** Normalizes `VessPhoneInput` value to E.164 for the device API. */
function normalizeMsisdnForApi(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed.length) return undefined
  if (trimmed.startsWith('+')) return trimmed

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 13 && digits.startsWith('234')) return `+${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `+234${digits.slice(1)}`
  if (digits.length > 0) return `+${digits}`

  return undefined
}

function mapDashboardConfigFieldsFromForm(
  values: DeviceConfigurationFormValues,
): Pick<
  DashboardDeviceConfigurationPayload,
  | 'msisdn'
  | 'imei'
  | 'device_group'
  | 'tags'
  | 'alert_battery_threshold'
  | 'alert_offline_duration_minutes'
> {
  const deviceGroup = values.deviceGroup.trim()
  const tags = parseTagsFromForm(values.tags)
  const msisdn = normalizeMsisdnForApi(values.msisdn)
  const imei = values.imei.trim()

  return {
    ...(msisdn ? { msisdn } : {}),
    ...(imei.length > 0 ? { imei } : {}),
    ...(deviceGroup.length > 0 ? { device_group: deviceGroup } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    alert_battery_threshold: values.lowBatteryPercent,
    alert_offline_duration_minutes: values.offlineMinutes,
  }
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

  return {
    device_id,
    device_name,
    location,
    latitude: coords.latitude,
    longitude: coords.longitude,
    ...mapDashboardConfigFieldsFromForm(values),
  }
}

export function mapDeviceConfigurationFormToUpdatePayload(
  values: DeviceConfigurationFormValues,
  coords: { latitude: number; longitude: number; location: string },
): UpdateDevicePayload {
  return {
    device_name: values.deviceName.trim(),
    location: coords.location,
    latitude: coords.latitude,
    longitude: coords.longitude,
    ...mapDashboardConfigFieldsFromForm(values),
  }
}

export function deviceEditDefaultsToFormValues(defaults: DeviceEditDefaults): DeviceConfigurationFormValues {
  return {
    deviceName: defaults.name,
    locationMode: defaults.locationMode,
    locationManual: defaults.locationManual,
    deviceGroup: defaults.deviceGroup,
    msisdn: defaults.msisdn ?? '',
    imei: defaults.imei ?? '',
    tags: defaults.tags,
    lowBatteryPercent: defaults.lowBatteryPercent,
    offlineMinutes: defaults.offlineMinutes,
  }
}
