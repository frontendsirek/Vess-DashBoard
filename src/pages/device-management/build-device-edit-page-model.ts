/**
 * Seeds edit form + detected-location card from GET `/devices/:id/` (same source as DeviceDetailPage).
 */

import type { DeviceEditDefaults } from '@/data/device-management'
import {
  deviceEditThresholdDefaults,
  formatDeviceCoordinatesDisplay,
  registerDeviceGroupOptions,
} from '@/data/device-management'
import { formatPhoneMsisdnDisplay, metaStr } from '@/lib/api-device-mapper'
import type { ApiDeviceDetail } from '@/types/device'

import { MISSING_API_FIELD_DISPLAY, buildDeviceManagementDetailPageModel } from './build-device-detail-page-model'

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
  routeDeviceId: string,
): DeviceEditDefaults {
  const thresholds = deviceEditThresholdDefaults(routeDeviceId)
  const model = buildDeviceManagementDetailPageModel(api)
  const meta = api.metadata ?? {}

  const slugFromMeta = metaStr(meta, 'group')
  const normalizedMetaGroup =
    slugFromMeta ?
      slugFromMeta.trim().toLowerCase().replace(/\s+/g, '-')
    : ''

  const allowedGroupSlugs = new Set<string>(
    registerDeviceGroupOptions.map((o) => o.value).filter((v) => v !== ''),
  )

  const sidebarGroupSlug =
    typeof model.sidebar.group === 'string' && model.sidebar.group !== MISSING_API_FIELD_DISPLAY ?
      model.sidebar.group.trim().toLowerCase().replace(/\s+/g, '-')
    : ''

  let deviceGroup = ''
  if (normalizedMetaGroup.length > 0 && allowedGroupSlugs.has(normalizedMetaGroup))
    deviceGroup = normalizedMetaGroup
  else if (sidebarGroupSlug.length > 0 && allowedGroupSlugs.has(sidebarGroupSlug))
    deviceGroup = sidebarGroupSlug

  const rawPhone = metaStr(meta, 'phone_number')
  let msisdn = ''
  if (rawPhone) msisdn = formatPhoneMsisdnDisplay(rawPhone).replace(/\s/g, '')
  else if (
    model.network.msisdnDisplay !== MISSING_API_FIELD_DISPLAY &&
    model.network.msisdnDisplay.trim().length > 0
  )
    msisdn = model.network.msisdnDisplay.replace(/\s/g, '')

  const tagsJoined =
    model.sidebar.tags.length > 0 ?
      model.sidebar.tags.join(', ')
    : ''

  return {
    name: api.device_name.trim().length > 0 ? api.device_name : '',
    locationMode: 'detected',
    locationManual:
      typeof api.location === 'string' && api.location.trim().length > 0 ?
        api.location.trim()
      : '',
    deviceGroup,
    msisdn,
    tags: tagsJoined,
    lowBatteryPercent: thresholds.lowBatteryPercent,
    offlineMinutes: thresholds.offlineMinutes,
  }
}
