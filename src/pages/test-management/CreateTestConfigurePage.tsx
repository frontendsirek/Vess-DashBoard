import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowBackIcon, ChevronDownIcon } from '@/components/icons'
import { Topbar } from '@/components/layout/Topbar'
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
import {
  buildConfigureDefaultValues,
  createConfigureSchema,
  toConfigureDraft,
  type ConfigureFormValues,
} from '@/schemas/create-test/configure.schema'
import type { DataTestMethod, TestManagementConfigureState } from '@/types/create-test'

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
      <span className="text-vess-grey-950">{children}</span>
      {required && <span className="text-vess-red-500">*</span>}
    </div>
  )
}

function SubFieldLabel({ children }: { children: string }) {
  return (
    <span className="text-[15px] font-light leading-[18px] text-vess-grey-950">{children}</span>
  )
}

const MOCK_DEVICES = [
  { value: 'device-alpha', label: 'Device Alpha' },
  { value: 'device-beta', label: 'Device Beta' },
  { value: 'device-lab-1', label: 'Lab Gateway 1' },
]

const NONE = '__none__'

const DATA_METHOD_OPTIONS: { value: DataTestMethod; label: string }[] = [
  { value: 'target-url', label: 'Target URL' },
  { value: 'ping', label: 'Ping' },
]

const formMessageClassName = 'text-[13px] font-normal leading-[16px] text-vess-red-500'

function NumberStepperRow({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex h-[50px] w-full items-center justify-between rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
      <span className="text-[15px] font-normal leading-[18px] text-vess-grey-950">{value}</span>
      <div className="flex flex-col">
        <button
          type="button"
          aria-label="Increase value"
          className="flex size-[22px] items-center justify-center text-vess-grey-950"
          onClick={() => onChange(value + 1)}
        >
          <ChevronDownIcon className="size-5 -rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Decrease value"
          className="flex size-[22px] items-center justify-center text-vess-grey-950"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <ChevronDownIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

export default function CreateTestConfigurePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const step1 = (location.state as TestManagementConfigureState | null)?.step1
  const restore = (location.state as TestManagementConfigureState | null)?.restore

  const testType = step1?.testType ?? 'Call'
  const configureSchema = useMemo(() => createConfigureSchema(testType), [testType])

  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureSchema),
    defaultValues: buildConfigureDefaultValues(restore),
    mode: 'onSubmit',
  })

  useEffect(() => {
    if (!step1) {
      navigate('/test-management', { replace: true })
    }
  }, [step1, navigate])

  useEffect(() => {
    form.reset(buildConfigureDefaultValues(restore))
  }, [location.key, restore, form])

  const dataTestMethod = useWatch({ control: form.control, name: 'dataTestMethod' })

  if (!step1) return null

  const showCallDuration = testType === 'Call'
  const showMessageText = testType === 'SMS'
  const showDestinationDevice = testType !== 'Data'
  const showDataTesting = testType === 'Data'

  function goBack() {
    navigate(-1)
  }

  function onSubmit(values: ConfigureFormValues) {
    if (!step1) return
    navigate('/test-management/new/schedule', {
      state: { configure: toConfigureDraft(step1, values, testType) },
    })
  }

  return (
    <>
      <Topbar title="Test Management" subtitle="Test configuration & results" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5"
            noValidate
          >
            <button
              type="button"
              onClick={goBack}
              className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
            >
              <ArrowBackIcon className="size-6" />
              <span className="text-[18px] font-light leading-[21.6px]">Back</span>
            </button>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">
                Create New Test
              </h1>
              <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">
                Step 2 : Configuration
              </p>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-6">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3 space-y-0">
                    <FieldLabel required>Test Name</FieldLabel>
                    <FormControl>
                      <div className="min-h-[50px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3">
                        <input
                          {...field}
                          placeholder="Enter test name"
                          className="w-full bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3 space-y-0">
                    <FieldLabel>Description</FieldLabel>
                    <FormControl>
                      <div className="min-h-[127px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
                        <textarea
                          {...field}
                          placeholder="Enter description"
                          rows={4}
                          className="w-full resize-none bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceDevice"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col gap-3 space-y-0">
                    <FieldLabel required>Source Device</FieldLabel>
                    <FormControl>
                      <div className="flex flex-col gap-1.5">
                        <Select
                          value={field.value ? field.value : NONE}
                          onValueChange={(v) => field.onChange(v === NONE ? '' : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select device" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>Select device</SelectItem>
                            {MOCK_DEVICES.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex h-[88px] flex-col items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
                          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[15px] font-light leading-[18px] text-vess-grey-500">
                            <span>No Device Found?</span>
                            <button
                              type="button"
                              className="text-[15px] font-light text-vess-primary-500 underline decoration-solid"
                            >
                              Create New device
                            </button>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              {showDestinationDevice && (
                <FormField
                  control={form.control}
                  name="destinationDevice"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-3 space-y-0">
                      <FieldLabel required>Destination Device</FieldLabel>
                      <FormControl>
                        <div className="flex flex-col gap-1.5">
                          <Select
                            value={field.value ? field.value : NONE}
                            onValueChange={(v) => field.onChange(v === NONE ? '' : v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select device" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NONE}>Select device</SelectItem>
                              {MOCK_DEVICES.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                  {d.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex h-[88px] flex-col items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[15px] font-light leading-[18px] text-vess-grey-500">
                              <span>No Device Found?</span>
                              <button
                                type="button"
                                className="text-[15px] font-light text-vess-primary-500 underline decoration-solid"
                              >
                                Create New device
                              </button>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />
              )}

              {showDataTesting && (
                <div className="flex w-full flex-col gap-4">
                  <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
                    <span className="text-vess-grey-950">Data Testing </span>
                    <span className="text-vess-red-500">*</span>
                  </div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="dataTestMethod"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-3 space-y-0">
                          <SubFieldLabel>Test Method</SubFieldLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DATA_METHOD_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className={formMessageClassName} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataTargetValue"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-3 space-y-0">
                          <SubFieldLabel>
                            {(dataTestMethod ?? 'target-url') === 'ping'
                              ? 'Host / IP Address'
                              : 'Endpoint URL'}
                          </SubFieldLabel>
                          <FormControl>
                            <div className="flex min-h-[50px] items-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3">
                              <input
                                {...field}
                                placeholder={
                                  (dataTestMethod ?? 'target-url') === 'ping'
                                    ? '192.168.1.1'
                                    : 'https://api.example.com/v1'
                                }
                                className="w-full bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className={formMessageClassName} />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {showDataTesting && (
                <FormField
                  control={form.control}
                  name="payloadSizeKb"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-3 space-y-0">
                      <FieldLabel>Payload Size (KB)</FieldLabel>
                      <FormControl>
                        <NumberStepperRow value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />
              )}

              {showMessageText && (
                <FormField
                  control={form.control}
                  name="messageText"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-3 space-y-0">
                      <FieldLabel required>Message Text</FieldLabel>
                      <FormControl>
                        <div className="min-h-[127px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
                          <textarea
                            {...field}
                            placeholder="Enter message"
                            rows={4}
                            className="w-full resize-none bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />
              )}

              {showCallDuration && (
                <FormField
                  control={form.control}
                  name="callDurationSeconds"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-3 space-y-0">
                      <FieldLabel required>Call Duration (seconds)</FieldLabel>
                      <FormControl>
                        <NumberStepperRow value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex h-12 flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-full w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 text-[15px] font-medium leading-[18px] text-vess-grey-950"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
