import type { TestType } from '@/data/mock'

export type CreationMethod = 'single' | 'bulk'

/** After Step 1 modal (creation method, optional bulk CSV, and test type). */
export type CreateTestStep1Draft = {
  creationMethod: CreationMethod
  testType: TestType | null
}

/** Data Step 2 test method (Figma 707:20505, 631:9161). */
export type DataTestMethod = 'target-url' | 'ping'

/** After Step 2 configuration. */
export type CreateTestConfigureDraft = CreateTestStep1Draft & {
  testName: string
  description: string
  sourceDevice: string
  destinationDevice: string
  callDurationSeconds: number
  /** SMS Step 2 (Figma 707:20058). */
  messageText: string
  dataTestMethod: DataTestMethod
  /** Endpoint URL when `target-url`, or Host/IP when `ping`. */
  dataTargetValue: string
  payloadSizeKb: number
}

export type ConfigureStepRestoreFields = Pick<
  CreateTestConfigureDraft,
  | 'testName'
  | 'description'
  | 'callDurationSeconds'
  | 'messageText'
  | 'dataTestMethod'
  | 'dataTargetValue'
  | 'payloadSizeKb'
  | 'sourceDevice'
  | 'destinationDevice'
>

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
  restore?: Partial<ConfigureStepRestoreFields>
}

export type TestManagementScheduleState = { configure: CreateTestConfigureDraft }

export type EditScheduleRestoreFields = Pick<
  CreateTestScheduleDraft,
  | 'scheduleKind'
  | 'immediate'
  | 'scheduledDateTime'
  | 'retryOnFailure'
  | 'frequency'
  | 'startDateTime'
  | 'endDateTime'
  | 'businessHoursOnly'
>

export type TestManagementEditScheduleState = {
  testId: string
  configure: CreateTestConfigureDraft
  scheduleRestore: EditScheduleRestoreFields
}

export type TestDetailFromWizardState = { wizardResult: CreateTestScheduleDraft }
