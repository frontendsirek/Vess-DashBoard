/**
 * Seeds edit form + detected-location card from GET `/devices/:id/` (same source as DeviceDetailPage).
 */

import type { DeviceEditDefaults } from '@/data/device-management'
import {
  formatDeviceCoordinatesDisplay,
  registerDeviceGroupOptions,
} from '@/data/device-management'
import { deviceTagsFromDevice } from '@/lib/api-device-detail-accessors'
import { formatPhoneMsisdnDisplay } from '@/lib/api-device-mapper'
import type { ApiDeviceDetail } from '@/types/device'

export type DeviceEditDetectedLocationModel = {
  headline: string
  city: string
  coordinates: string
}

export function buildDeviceEditDetectedLocationFromApi(
  api: ApiDeviceDetail,
): DeviceEditDetectedLocationModel {
  const lat = api.latitude
  const lng = api.longitude
  const hasCoords =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)

  const coordinates =
    hasCoords ? formatDeviceCoordinatesDisplay(lat, lng) : '-'
  const city = typeof api.location === 'string' && api.location.trim().length > 0 ? api.location.trim() : '-'

  return {
    headline: 'Current location',
    city,
    coordinates,
  }
}

export function buildDeviceEditDefaultsFromApi(
  api: ApiDeviceDetail,
): DeviceEditDefaults {
  const allowedGroupSlugs = new Set<string>(
    registerDeviceGroupOptions.map((o) => o.value).filter((v) => v !== ''),
  )

  const apiGroupSlug = api.device_group?.trim().toLowerCase().replace(/\s+/g, '-') ?? ''
  const deviceGroup =
    apiGroupSlug.length > 0 && allowedGroupSlugs.has(apiGroupSlug) ? apiGroupSlug : ''

  const rawPhone = api.msisdn?.trim() || api.network?.msisdn?.trim() || ''
  const msisdn = rawPhone.length > 0 ? formatPhoneMsisdnDisplay(rawPhone).replace(/\s/g, '') : ''

  const tagsJoined = deviceTagsFromDevice(api).join(', ')

  const batteryThreshold = api.alert_thresholds?.battery_threshold
  const offlineMinutes = api.alert_thresholds?.offline_duration_minutes

  return {
    name: api.device_name.trim().length > 0 ? api.device_name : '',
    locationMode: 'detected',
    locationManual:
      typeof api.location === 'string' && api.location.trim().length > 0 ?
        api.location.trim()
      : '',
    deviceGroup,
    msisdn,
    imei: api.imei?.trim() ?? '',
    tags: tagsJoined,
    lowBatteryPercent:
      typeof batteryThreshold === 'number' && Number.isFinite(batteryThreshold) ?
        Math.min(100, Math.max(1, Math.round(batteryThreshold)))
      : 15,
    offlineMinutes:
      typeof offlineMinutes === 'number' && Number.isFinite(offlineMinutes) ?
        Math.max(1, Math.round(offlineMinutes))
      : 30,
  }
}
