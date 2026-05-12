import type { TestType } from '@/data/mock'

export type CreationMethod = 'single' | 'bulk'

/** After Step 1 modal (creation method + optional test type for single). */
export type CreateTestStep1Draft = {
  creationMethod: CreationMethod
  testType: TestType | null
}

/** After Step 2 configuration. */
export type CreateTestConfigureDraft = CreateTestStep1Draft & {
  testName: string
  description: string
  sourceDevice: string
  destinationDevice: string
  callDurationSeconds: number
}

export type ScheduleKind = 'one-time' | 'recurring'

/** After Step 3 scheduling (full wizard). */
export type CreateTestScheduleDraft = CreateTestConfigureDraft & {
  scheduleKind: ScheduleKind
  immediate: boolean
  scheduledDateTime: string
  retryOnFailure: string
  frequency: string
  startDateTime: string
  endDateTime: string
  businessHoursOnly: boolean
}

export type TestManagementConfigureState = {
  step1: CreateTestStep1Draft
  restore?: Pick<CreateTestConfigureDraft, 'testName' | 'description' | 'callDurationSeconds'>
}

export type TestManagementScheduleState = { configure: CreateTestConfigureDraft }

export type TestDetailFromWizardState = { wizardResult: CreateTestScheduleDraft }
