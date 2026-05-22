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

export type DeviceConfigurationFormValues = z.infer<typeof deviceConfigurationFormSchema>

export const deviceConfigurationFormDefaultValues: DeviceConfigurationFormValues = {
  deviceName: '',
  locationMode: 'detected',
  locationManual: '',
  deviceGroup: '',
  msisdn: '',
  tags: '',
  lowBatteryPercent: 15,
  offlineMinutes: 10,
}
