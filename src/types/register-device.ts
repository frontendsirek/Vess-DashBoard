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
