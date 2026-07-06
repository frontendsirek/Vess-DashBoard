import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowBackIcon } from '@/components/icons'
import { DateTimePickerField } from '@/components/ui/date-time-picker-field'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTestMutation } from '@/hooks/tests/use-create-test-mutation'
import { cn } from '@/lib/utils'
import {
  FREQUENCY_OPTIONS,
  RETRY_OPTIONS,
  scheduleDefaultValues,
  scheduleFormSchema,
  toScheduleDraft,
  type ScheduleFormValues,
} from '@/schemas/create-test/schedule.schema'
import { useAuthStore } from '@/stores/auth-store'
import type { TestManagementScheduleState } from '@/types/create-test'
import type { ApiTestAction } from '@/types/test'
import { toast } from 'sonner'

const formMessageClassName = 'text-[11px] font-normal leading-[16px] text-vess-red-500'

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-1 text-[16px] font-normal leading-[21.6px]">
      <span className="text-vess-grey-950">{children}</span>
      {required && <span className="text-vess-red-500">*</span>}
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
      <span className="text-[13px] font-normal leading-[18px] text-vess-grey-950">{label}</span>
    </label>
  )
}

export default function CreateTestSchedulePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const configure = (location.state as TestManagementScheduleState | null)?.configure
  const { mutateAsync, isPending, reset } = useCreateTestMutation()
  const pendingActionRef = useRef<ApiTestAction>('activate')

  const [authError, setAuthError] = useState<string | null>(null)

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: scheduleDefaultValues,
    mode: 'onSubmit',
  })

  const scheduleKind = useWatch({ control: form.control, name: 'scheduleKind' })
  const immediate = useWatch({ control: form.control, name: 'immediate' })

  useEffect(() => {
    if (!configure) {
      navigate('/test-management', { replace: true })
    }
  }, [configure, navigate])

  if (!configure) return null

  const configureState = configure
  const dateDisabled = scheduleKind === 'one-time' && immediate
  const nextExecutions = [
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
    '13/03/2026, 17:44:45',
  ]

  function goBackToConfigure() {
    navigate('/test-management/new/configure', {
      state: {
        step1: { creationMethod: configureState.creationMethod, testType: configureState.testType },
        restore: {
          testName: configureState.testName,
          description: configureState.description,
          callDurationSeconds: configureState.callDurationSeconds,
          messageText: configureState.messageText,
          dataTestMethod: configureState.dataTestMethod,
          dataTargetValue: configureState.dataTargetValue,
          payloadSizeKb: configureState.payloadSizeKb,
          sourceDevice: configureState.sourceDevice,
          destinationDevice: configureState.destinationDevice,
        },
      },
    })
  }

  function goBackHistory() {
    navigate(-1)
  }

  const submitError = authError

  async function onSubmit(values: ScheduleFormValues) {
    if (!accessToken) {
      const msg = 'You must be signed in to create a test.'
      setAuthError(msg)
      toast.error(msg)
      return
    }
    setAuthError(null)
    reset()
    try {
      await mutateAsync({
        draft: toScheduleDraft(configureState, values),
        action: pendingActionRef.current,
      })
    } catch {
      // `error` and `isError` are set by React Query
    }
  }

  function handleActivateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    pendingActionRef.current = 'activate'
    void form.handleSubmit(onSubmit)(event)
  }

  function handleDraftSubmit() {
    pendingActionRef.current = 'draft'
    void form.handleSubmit(onSubmit)()
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-5 py-6">
        <Form {...form}>
          <form
            onSubmit={handleActivateSubmit}
            className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5"
            noValidate
          >
            <button
              type="button"
              onClick={goBackHistory}
              className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
            >
              <ArrowBackIcon className="size-6" />
              <span className="text-[16px] font-light leading-[21.6px]">Back</span>
            </button>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-[23px] font-semibold leading-[30px] text-vess-grey-950">Create New Test</h1>
              <p className="text-[13px] font-light leading-[18px] text-vess-grey-500">Step 3: Scheduling</p>
            </div>

            <div
              className={cn(
                'flex flex-col gap-8 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-6',
                scheduleKind === 'recurring' && 'gap-6',
              )}
            >
              <FormField
                control={form.control}
                name="scheduleKind"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-3 space-y-0">
                    <div className="flex flex-wrap items-start gap-1 text-[16px] font-normal leading-[21.6px]">
                      <span className="text-vess-grey-950">Schedule Type </span>
                      <span className="text-vess-red-500">*</span>
                    </div>
                    <FormControl>
                      <div className="flex flex-wrap gap-8">
                        <ScheduleRadio
                          name="scheduleKind"
                          selected={field.value === 'one-time'}
                          onSelect={() => field.onChange('one-time')}
                          label="One-time"
                        />
                        <ScheduleRadio
                          name="scheduleKind"
                          selected={field.value === 'recurring'}
                          onSelect={() => field.onChange('recurring')}
                          label="Recurring"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              {scheduleKind === 'one-time' && (
                <>
                  <FormField
                    control={form.control}
                    name="immediate"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[16px] font-normal leading-[21.6px] text-vess-grey-950">
                              Immediate
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={field.value}
                              onClick={() => field.onChange(!field.value)}
                              className={cn(
                                'relative flex h-[22px] w-9 shrink-0 items-center rounded-full p-[3px] transition-colors',
                                field.value
                                  ? 'justify-end bg-vess-primary-500'
                                  : 'justify-start bg-vess-grey-200',
                              )}
                            >
                              <span className="size-4 shrink-0 rounded-full bg-vess-grey-50 shadow-sm" />
                            </button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduledDateTime"
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          'flex w-full flex-col gap-3 space-y-0',
                          dateDisabled && 'pointer-events-none opacity-40',
                        )}
                      >
                        <FieldLabel required>Scheduled Date & Time</FieldLabel>
                        <FormControl>
                          <DateTimePickerField
                            value={field.value}
                            onChange={field.onChange}
                            disabled={dateDisabled}
                          />
                        </FormControl>
                        <FormMessage className={formMessageClassName} />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {scheduleKind === 'recurring' && (
                <>
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-3 space-y-0">
                        <FieldLabel required>Frequency</FieldLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {FREQUENCY_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className={formMessageClassName} />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                    <FormField
                      control={form.control}
                      name="startDateTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-1 flex-col gap-3 space-y-0">
                          <FieldLabel required>Start Date & Time</FieldLabel>
                          <FormControl>
                            <DateTimePickerField value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage className={formMessageClassName} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDateTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-1 flex-col gap-3 space-y-0">
                          <div className="flex flex-wrap items-start gap-1 text-[16px] font-normal leading-[21.6px]">
                            <span className="text-vess-grey-950">End Date & Time (optional)</span>
                            <span className="text-vess-red-500">*</span>
                          </div>
                          <FormControl>
                            <DateTimePickerField value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage className={formMessageClassName} />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessHoursOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-3 space-y-0">
                        <span className="text-[16px] font-normal leading-[21.6px] text-vess-grey-950">
                          Execution Window
                        </span>
                        <FormControl>
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="size-[18px] shrink-0 cursor-pointer rounded border border-vess-grey-400 bg-vess-grey-50 accent-vess-primary-500"
                            />
                            <span className="text-[13px] font-normal leading-[18px] text-vess-grey-950">
                              Only during business hours (9AM-5PM)
                            </span>
                          </label>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="retryOnFailure"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col gap-3 space-y-0">
                        <FieldLabel required>Retry on Failure</FieldLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select retry on failure" />
                            </SelectTrigger>
                            <SelectContent>
                              {RETRY_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className={formMessageClassName} />
                      </FormItem>
                    )}
                  />

                  <div className="h-px w-full bg-vess-grey-200" />
                  <div className="flex flex-col gap-3 text-vess-grey-950">
                    <p className="text-[16px] font-normal leading-[21.6px]">Next 5 executions:</p>
                    <ul className="flex flex-col gap-3 text-[13px] font-normal leading-[18px]">
                      {nextExecutions.map((line, i) => (
                        <li key={`${line}-${i}`}>• {line}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {scheduleKind === 'one-time' && (
                <FormField
                  control={form.control}
                  name="retryOnFailure"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-3 space-y-0">
                      <FieldLabel required>Retry on Failure</FieldLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retry on failure" />
                          </SelectTrigger>
                          <SelectContent>
                            {RETRY_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {submitError && (
              <p className="text-[13px] font-normal leading-[18px] text-vess-red-500" role="alert">
                {submitError}
              </p>
            )}

            <div className="flex min-h-12 flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBackToConfigure}
                disabled={isPending}
                className="inline-flex h-12 w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 text-[13px] font-medium leading-[18px] text-vess-grey-950 disabled:opacity-50"
              >
                Back
              </button>
              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDraftSubmit}
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-950 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-50 disabled:opacity-50"
                >
                  {isPending ? 'Creating…' : 'Create & Activate'}
                </button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
