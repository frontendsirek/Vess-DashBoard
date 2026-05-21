import { z } from 'zod'
import type { CreateTestStep1Draft } from '@/types/create-test'

export const step1FormFieldsSchema = z.object({
  creationMethod: z.enum(['single', 'bulk']).nullable(),
  testType: z.enum(['Call', 'SMS', 'Data']).nullable(),
  bulkCsvFile: z.instanceof(File).optional(),
})

export type Step1FormValues = z.infer<typeof step1FormFieldsSchema>

export const step1FormSchema = step1FormFieldsSchema.superRefine((data, ctx) => {
  if (!data.creationMethod) {
    ctx.addIssue({
      code: 'custom',
      message: 'Select a creation method',
      path: ['creationMethod'],
    })
    return
  }
  if (data.creationMethod === 'single') {
    if (!data.testType) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select a test type',
        path: ['testType'],
      })
    }
    return
  }
  if (data.creationMethod === 'bulk') {
    if (!data.bulkCsvFile) {
      ctx.addIssue({
        code: 'custom',
        message: 'Upload a CSV file',
        path: ['bulkCsvFile'],
      })
    }
  }
})

export const step1DefaultValues: Step1FormValues = {
  creationMethod: null,
  testType: null,
  bulkCsvFile: undefined,
}

export function toStep1Draft(values: Step1FormValues): CreateTestStep1Draft {
  return {
    creationMethod: values.creationMethod!,
    testType: values.creationMethod === 'bulk' ? null : values.testType!,
  }
}
