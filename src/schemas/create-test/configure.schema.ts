import { z } from 'zod'
import type { TestType } from '@/data/mock'
import type {
  ConfigureStepRestoreFields,
  CreateTestConfigureDraft,
  CreateTestStep1Draft,
} from '@/types/create-test'

export const configureFormFieldsSchema = z.object({
  testName: z.string(),
  description: z.string(),
  sourceDevice: z.string(),
  destinationDevice: z.string(),
  callDurationSeconds: z.number(),
  messageText: z.string(),
  dataTestMethod: z.enum(['target-url', 'ping']),
  dataTargetValue: z.string(),
  payloadSizeKb: z.number(),
})

export type ConfigureFormValues = z.infer<typeof configureFormFieldsSchema>

export function buildConfigureDefaultValues(
  restore?: Partial<ConfigureStepRestoreFields>,
): ConfigureFormValues {
  return {
    testName: restore?.testName ?? '',
    description: restore?.description ?? '',
    sourceDevice: restore?.sourceDevice ?? '',
    destinationDevice: restore?.destinationDevice ?? '',
    callDurationSeconds: restore?.callDurationSeconds ?? 60,
    messageText: restore?.messageText ?? '',
    dataTestMethod: restore?.dataTestMethod ?? 'target-url',
    dataTargetValue: restore?.dataTargetValue ?? '',
    payloadSizeKb: restore?.payloadSizeKb ?? 1024,
  }
}

export function createConfigureSchema(testType: TestType) {
  return configureFormFieldsSchema.superRefine((data, ctx) => {
    if (!data.testName.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Test name is required',
        path: ['testName'],
      })
    }

    if (!data.sourceDevice) {
      ctx.addIssue({
        code: 'custom',
        message: 'Source device is required',
        path: ['sourceDevice'],
      })
    }

    if (testType === 'Call') {
      if (!data.destinationDevice) {
        ctx.addIssue({
          code: 'custom',
          message: 'Destination device is required',
          path: ['destinationDevice'],
        })
      }
      if (data.callDurationSeconds < 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Call duration must be at least 1 second',
          path: ['callDurationSeconds'],
        })
      }
    }

    if (testType === 'SMS') {
      if (!data.destinationDevice) {
        ctx.addIssue({
          code: 'custom',
          message: 'Destination device is required',
          path: ['destinationDevice'],
        })
      }
      if (!data.messageText.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Message text is required',
          path: ['messageText'],
        })
      }
    }

    if (testType === 'Data') {
      if (!data.dataTargetValue.trim()) {
        ctx.addIssue({
          code: 'custom',
          message:
            data.dataTestMethod === 'ping'
              ? 'Host / IP address is required'
              : 'Endpoint URL is required',
          path: ['dataTargetValue'],
        })
      }
      if (data.payloadSizeKb < 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Payload size must be at least 1 KB',
          path: ['payloadSizeKb'],
        })
      }
    }
  })
}

export function toConfigureDraft(
  step1: CreateTestStep1Draft,
  values: ConfigureFormValues,
  testType: TestType,
): CreateTestConfigureDraft {
  return {
    ...step1,
    testName: values.testName.trim(),
    description: values.description,
    sourceDevice: values.sourceDevice,
    destinationDevice: testType === 'Data' ? '' : values.destinationDevice,
    callDurationSeconds: testType === 'Call' ? values.callDurationSeconds : 0,
    messageText: values.messageText,
    dataTestMethod: values.dataTestMethod,
    dataTargetValue: values.dataTargetValue,
    payloadSizeKb: testType === 'Data' ? values.payloadSizeKb : 0,
  }
}
