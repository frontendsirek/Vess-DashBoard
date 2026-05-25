import { z } from 'zod'

export const deregisterDeviceSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Please provide a reason for unregistering this device.')
    .max(500, 'Reason must be 500 characters or fewer.'),
})

export type DeregisterDeviceFormValues = z.infer<typeof deregisterDeviceSchema>
