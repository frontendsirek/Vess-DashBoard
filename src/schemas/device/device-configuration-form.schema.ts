import { z } from 'zod'

/** Shared shape for Register + Edit device configuration UI. */
export const deviceConfigurationFormSchema = z
  .object({
    deviceName: z.string().max(256, 'Device name is too long'),
    locationMode: z.enum(['detected', 'manual']),
    locationManual: z.string(),
    deviceGroup: z.string(),
    /** E.164 or empty — aligned with `VessPhoneInput` */
    msisdn: z.string(),
    imei: z.string().regex(/^\d{0,15}$/, 'IMEI must be up to 15 digits'),
    tags: z.string(),
    lowBatteryPercent: z.number().int().min(1).max(100),
    offlineMinutes: z.number().int().min(1).max(525600),
  })
  .superRefine((data, ctx) => {
    const name = data.deviceName.trim()
    if (!name.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Device name is required',
        path: ['deviceName'],
      })
    }
    if (data.locationMode === 'manual') {
      const loc = data.locationManual.trim()
      if (!loc.length) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a location',
          path: ['locationManual'],
        })
      }
    }
  })

/** Registration-specific schema — IMEI is required (exactly 15 digits). */
export const registerDeviceConfigurationFormSchema = deviceConfigurationFormSchema.superRefine(
  (data, ctx) => {
    const imei = data.imei.trim()
    if (!imei.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'IMEI is required',
        path: ['imei'],
      })
    } else if (!/^\d{15}$/.test(imei)) {
      ctx.addIssue({
        code: 'custom',
        message: 'IMEI must be exactly 15 digits',
        path: ['imei'],
      })
    }
  },
)

export type DeviceConfigurationFormValues = z.infer<typeof deviceConfigurationFormSchema>

export const deviceConfigurationFormDefaultValues: DeviceConfigurationFormValues = {
  deviceName: '',
  locationMode: 'detected',
  locationManual: '',
  deviceGroup: '',
  msisdn: '',
  imei: '',
  tags: '',
  lowBatteryPercent: 15,
  offlineMinutes: 10,
}
