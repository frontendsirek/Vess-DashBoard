import { z } from 'zod'
import { parseScheduleDateTime } from '@/lib/datetime'
import type { CreateTestConfigureDraft, CreateTestScheduleDraft } from '@/types/create-test'

export const RETRY_OPTIONS = ['2 attempts', '3 attempts', 'No retry'] as const
export const FREQUENCY_OPTIONS = ['Hourly', 'Daily', 'Weekly'] as const

export const scheduleFormFieldsSchema = z.object({
  scheduleKind: z.enum(['one-time', 'recurring']),
  immediate: z.boolean(),
  scheduledDateTime: z.string(),
  retryOnFailure: z.string().min(1, 'Retry on failure is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDateTime: z.string(),
  endDateTime: z.string(),
  businessHoursOnly: z.boolean(),
})

export type ScheduleFormValues = z.infer<typeof scheduleFormFieldsSchema>

export const scheduleFormSchema = scheduleFormFieldsSchema.superRefine((data, ctx) => {
  if (data.scheduleKind === 'one-time') {
    if (!data.immediate) {
      if (!data.scheduledDateTime.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Scheduled date & time is required',
          path: ['scheduledDateTime'],
        })
      } else if (!parseScheduleDateTime(data.scheduledDateTime)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a valid date and time',
          path: ['scheduledDateTime'],
        })
      }
    }
    return
  }

  if (!FREQUENCY_OPTIONS.includes(data.frequency as (typeof FREQUENCY_OPTIONS)[number])) {
    ctx.addIssue({
      code: 'custom',
      message: 'Frequency is required',
      path: ['frequency'],
    })
  }

  if (!data.startDateTime.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Start date & time is required',
      path: ['startDateTime'],
    })
  } else if (!parseScheduleDateTime(data.startDateTime)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a valid start date and time',
      path: ['startDateTime'],
    })
  }

  if (data.endDateTime.trim() && !parseScheduleDateTime(data.endDateTime)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a valid end date and time',
      path: ['endDateTime'],
    })
  }
})

export const scheduleDefaultValues: ScheduleFormValues = {
  scheduleKind: 'one-time',
  immediate: true,
  scheduledDateTime: '',
  retryOnFailure: RETRY_OPTIONS[0],
  frequency: FREQUENCY_OPTIONS[0],
  startDateTime: '',
  endDateTime: '',
  businessHoursOnly: false,
}

export function toScheduleDraft(
  configure: CreateTestConfigureDraft,
  values: ScheduleFormValues,
): CreateTestScheduleDraft {
  return {
    ...configure,
    ...values,
  }
}
