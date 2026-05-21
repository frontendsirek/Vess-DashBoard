import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowBackIcon } from '@/components/icons'
import { Topbar } from '@/components/layout/Topbar'
import { DateTimePickerField } from '@/components/ui/date-time-picker-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  formatTestMutationError,
  useCreateTestMutation,
} from '@/hooks/use-create-test'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import type {
  CreateTestScheduleDraft,
  ScheduleKind,
  TestManagementScheduleState,
} from '@/types/create-test'
import type { ApiTestAction } from '@/types/test'

const retryOptions = ['2 attempts', '3 attempts', 'No retry']
const frequencyOptions = ['Hourly', 'Daily', 'Weekly']

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
      <span className="text-vess-grey-950">{children}</span>
      {required && <span className="text-vess-red-500">*</span>}
    </div>
  )
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <FieldLabel required={required}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ScheduleRadio({
  selected,
  onSelect,
  label,
  name,
}: {
  selected: boolean
  onSelect: () => void
  label: string
  name: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="radio" name={name} className="sr-only" checked={selected} onChange={onSelect} />
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border bg-vess-grey-50',
          selected ? 'border-vess-primary-500 border-[0.5px] p-px' : 'border-vess-grey-200',
        )}
      >
        {selected && <span className="size-[18px] rounded-full border-[5px] border-vess-primary-500 bg-white" />}
      </span>
      <span className="text-[15px] font-normal leading-[18px] text-vess-grey-950">{label}</span>
    </label>
  )
}

export default function CreateTestSchedulePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const configure = (location.state as TestManagementScheduleState | null)?.configure
  const { mutateAsync, isPending, isError, error, reset } = useCreateTestMutation()

  const [authError, setAuthError] = useState<string | null>(null)
  const [scheduleKind, setScheduleKind] = useState<ScheduleKind>('one-time')
  const [immediate, setImmediate] = useState(true)
  const [scheduledDateTime, setScheduledDateTime] = useState('')
  const [retryOnFailure, setRetryOnFailure] = useState(retryOptions[0])
  const [frequency, setFrequency] = useState(frequencyOptions[0])
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false)

  useEffect(() => {
    if (!configure) {
      navigate('/test-management', { replace: true })
    }
  }, [configure, navigate])

  const fullDraft = useMemo((): CreateTestScheduleDraft | null => {
    if (!configure) return null
    return {
      ...configure,
      scheduleKind,
      immediate,
      scheduledDateTime,
      retryOnFailure,
      frequency,
      startDateTime,
      endDateTime,
      businessHoursOnly,
    }
  }, [
    configure,
    scheduleKind,
    immediate,
    scheduledDateTime,
    retryOnFailure,
    frequency,
    startDateTime,
    endDateTime,
    businessHoursOnly,
  ])

  if (!configure) return null

  const dateDisabled = scheduleKind === 'one-time' && immediate
  const nextExecutions = [
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
  ]

  function goBackToConfigure() {
    if (!configure) return
    navigate('/test-management/new/configure', {
      state: {
        step1: { creationMethod: configure.creationMethod, testType: configure.testType },
        restore: {
          testName: configure.testName,
          description: configure.description,
          callDurationSeconds: configure.callDurationSeconds,
          messageText: configure.messageText,
          dataTestMethod: configure.dataTestMethod,
          dataTargetValue: configure.dataTargetValue,
          payloadSizeKb: configure.payloadSizeKb,
          sourceDevice: configure.sourceDevice,
          destinationDevice: configure.destinationDevice,
        },
      },
    })
  }

  function goBackHistory() {
    navigate(-1)
  }

  const submitError =
    authError ?? (isError && error ? formatTestMutationError(error) : null)

  async function submitTest(action: ApiTestAction) {
    if (!fullDraft) return
    if (!accessToken) {
      setAuthError('You must be signed in to create a test.')
      return
    }
    setAuthError(null)
    reset()
    try {
      await mutateAsync({ draft: fullDraft, action })
    } catch {
      // `error` and `isError` are set by React Query
    }
  }

  return (
    <>
      <Topbar title="Test Management" subtitle="Test configuration & results" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5">
          <button
            type="button"
            onClick={goBackHistory}
            className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
          >
            <ArrowBackIcon className="size-6" />
            <span className="text-[18px] font-light leading-[21.6px]">Back</span>
          </button>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">Create New Test</h1>
            <p className="text-[15px] font-light leading-[18px] text-vess-grey-500">Step 3: Scheduling</p>
          </div>

          <div
            className={cn(
              'flex flex-col gap-8 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-6',
              scheduleKind === 'recurring' && 'gap-6',
            )}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
                <span className="text-vess-grey-950">Schedule Type </span>
                <span className="text-vess-red-500">*</span>
              </div>
              <div className="flex flex-wrap gap-8">
                <ScheduleRadio
                  name="scheduleKind"
                  selected={scheduleKind === 'one-time'}
                  onSelect={() => setScheduleKind('one-time')}
                  label="One-time"
                />
                <ScheduleRadio
                  name="scheduleKind"
                  selected={scheduleKind === 'recurring'}
                  onSelect={() => setScheduleKind('recurring')}
                  label="Recurring"
                />
              </div>
            </div>

            {scheduleKind === 'one-time' && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[18px] font-normal leading-[21.6px] text-vess-grey-950">Immediate</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={immediate}
                    onClick={() => setImmediate((v) => !v)}
                    className={cn(
                      'relative flex h-[22px] w-9 shrink-0 items-center rounded-full p-[3px] transition-colors',
                      immediate ? 'justify-end bg-vess-primary-500' : 'justify-start bg-vess-grey-200',
                    )}
                  >
                    <span className="size-4 shrink-0 rounded-full bg-vess-grey-50 shadow-sm" />
                  </button>
                </div>

                <div
                  className={cn(
                    'flex w-full flex-col gap-3',
                    dateDisabled && 'pointer-events-none opacity-40',
                  )}
                >
                  <FieldLabel required>Scheduled Date & Time</FieldLabel>
                  <DateTimePickerField
                    value={scheduledDateTime}
                    onChange={setScheduledDateTime}
                    disabled={dateDisabled}
                  />
                </div>
              </>
            )}

            {scheduleKind === 'recurring' && (
              <>
                <SelectField
                  label="Frequency"
                  required
                  value={frequency}
                  onChange={setFrequency}
                  options={frequencyOptions}
                />
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                  <div className="flex flex-1 flex-col gap-3">
                    <FieldLabel required>Start Date & Time</FieldLabel>
                    <DateTimePickerField value={startDateTime} onChange={setStartDateTime} />
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
                      <span className="text-vess-grey-950">End Date & Time (optional)</span>
                      <span className="text-vess-red-500">*</span>
                    </div>
                    <DateTimePickerField value={endDateTime} onChange={setEndDateTime} />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[18px] font-normal leading-[21.6px] text-vess-grey-950">Execution Window</span>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={businessHoursOnly}
                      onChange={(e) => setBusinessHoursOnly(e.target.checked)}
                      className="size-[18px] shrink-0 cursor-pointer rounded border border-vess-grey-400 bg-vess-grey-50 accent-vess-primary-500"
                    />
                    <span className="text-[15px] font-normal leading-[18px] text-vess-grey-950">
                      Only during business hours (9AM-5PM)
                    </span>
                  </label>
                </div>
                <SelectField
                  label="Retry on Failure"
                  required
                  value={retryOnFailure}
                  onChange={setRetryOnFailure}
                  options={retryOptions}
                />
                <div className="h-px w-full bg-vess-grey-200" />
                <div className="flex flex-col gap-3 text-vess-grey-950">
                  <p className="text-[18px] font-normal leading-[21.6px]">Next 5 executions:</p>
                  <ul className="flex flex-col gap-3 text-[15px] font-normal leading-[18px]">
                    {nextExecutions.map((line, i) => (
                      <li key={`${line}-${i}`}>• {line}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {scheduleKind === 'one-time' && (
              <SelectField
                label="Retry on Failure"
                required
                value={retryOnFailure}
                onChange={setRetryOnFailure}
                options={retryOptions}
              />
            )}
          </div>

          {submitError && (
            <p className="text-[15px] font-normal leading-[18px] text-vess-red-500" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex min-h-12 flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBackToConfigure}
              disabled={isPending}
              className="inline-flex h-12 w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 text-[15px] font-medium leading-[18px] text-vess-grey-950 disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => void submitTest('draft')}
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => void submitTest('activate')}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 disabled:opacity-50"
              >
                {isPending ? 'Creating…' : 'Create & Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
