import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowBackIcon, ChevronDownIcon } from '@/components/icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { TestConfigureDeviceFormField } from '@/components/test-management/create-test/TestConfigureDeviceFormField'
import { useDevicesListQuery } from '@/hooks/devices/use-devices-list-query'
import { assertApiEnvelopeSuccess } from '@/lib/assert-api-envelope'
import { mapApiProbeToEditFormSeed, type ProbeEditFormSeed } from '@/lib/api-test-mapper'
import { testQueryKeys } from '@/lib/test-query-keys'
import {
  buildConfigureDefaultValues,
  createConfigureSchema,
  toConfigureDraft,
  type ConfigureFormValues,
} from '@/schemas/create-test/configure.schema'
import { testService } from '@/services/test.service'
import { useAuthStore } from '@/stores/auth-store'
import type { DataTestMethod } from '@/types/create-test'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DEVICE_LIST_PAGE_SIZE = 100

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-1 text-[16px] font-normal leading-[21.6px]">
      <span className="text-vess-grey-950">{children}</span>
      {required && <span className="text-vess-red-500">*</span>}
    </div>
  )
}

function SubFieldLabel({ children }: { children: string }) {
  return (
    <span className="text-[13px] font-light leading-[18px] text-vess-grey-950">{children}</span>
  )
}

const DATA_METHOD_OPTIONS: { value: DataTestMethod; label: string }[] = [
  { value: 'target-url', label: 'Target URL' },
  { value: 'ping', label: 'Ping' },
]

const formMessageClassName = 'text-[11px] font-normal leading-[16px] text-vess-red-500'

function NumberStepperRow({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex h-[50px] w-full items-center justify-between rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
      <span className="text-[13px] font-normal leading-[18px] text-vess-grey-950">{value}</span>
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

export default function EditTestConfigurePage() {
  const navigate = useNavigate()
  const { testId = '' } = useParams()
  const accessToken = useAuthStore((s) => s.accessToken)
  const trimId = testId.trim()

  const probeQuery = useQuery({
    queryKey: testQueryKeys.detail(accessToken, trimId),
    enabled: Boolean(accessToken && trimId),
    queryFn: async () => {
      const { data } = await testService.getProbe(trimId)
      return assertApiEnvelopeSuccess(data, 'Could not load test.')
    },
  })

  const editSeed = useMemo(
    () => (probeQuery.isSuccess && probeQuery.data ? mapApiProbeToEditFormSeed(probeQuery.data) : null),
    [probeQuery.data, probeQuery.isSuccess],
  )

  useEffect(() => {
    if (!trimId) {
      navigate('/test-management', { replace: true })
    }
  }, [trimId, navigate])

  if (!accessToken) {
    return (
      <>
        <div className="px-5 py-6">
          <p className="text-[13px] text-vess-grey-800">Sign in to edit this test.</p>
        </div>
      </>
    )
  }

  if (probeQuery.isPending) {
    return (
      <>
        <div className="px-5 py-6">
          <p className="text-center text-[13px] text-vess-grey-600">Loading test…</p>
        </div>
      </>
    )
  }

  if (probeQuery.isError || !editSeed || !editSeed.step1.testType) {
    const errMsg =
      probeQuery.error instanceof Error ? probeQuery.error.message : 'Could not load test.'
    return (
      <>
        <div className="flex flex-col gap-4 px-5 py-6">
          <p className="text-[13px] text-vess-red-800">{errMsg}</p>
          <button
            type="button"
            onClick={() => navigate(`/test-management/${encodeURIComponent(trimId)}`)}
            className="w-fit rounded-lg border-2 border-vess-grey-100 px-4 py-2 text-[13px]"
          >
            Back to test
          </button>
        </div>
      </>
    )
  }

  return <EditTestConfigureForm key={trimId} testId={trimId} editSeed={editSeed} />
}

type EditTestConfigureFormProps = {
  testId: string
  editSeed: ProbeEditFormSeed
}

function EditTestConfigureForm({ testId, editSeed }: EditTestConfigureFormProps) {
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const step1Draft = editSeed.step1
  const scheduleRestore = editSeed.scheduleRestore
  const testType = step1Draft.testType ?? 'Call'
  const configureSchema = useMemo(() => createConfigureSchema(testType), [testType])

  const devicesQuery = useDevicesListQuery(
    accessToken,
    { page: 1, page_size: DEVICE_LIST_PAGE_SIZE },
    true,
  )

  const devices = useMemo(() => devicesQuery.data?.results ?? [], [devicesQuery.data])

  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureSchema),
    defaultValues: buildConfigureDefaultValues(editSeed.configureRestore),
    mode: 'onSubmit',
  })

  const dataTestMethod = useWatch({ control: form.control, name: 'dataTestMethod' })

  const showCallDuration = testType === 'Call'
  const showMessageText = testType === 'SMS'
  const showDestinationDevice = testType !== 'Data'
  const showDataTesting = testType === 'Data'

  function goBack() {
    navigate(`/test-management/${encodeURIComponent(testId)}`)
  }

  function onSubmit(values: ConfigureFormValues) {
    navigate(`/test-management/${encodeURIComponent(testId)}/edit/schedule`, {
      state: {
        testId,
        configure: toConfigureDraft(step1Draft, values, testType),
        scheduleRestore,
      },
    })
  }

  return (
    <>
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
              <span className="text-[16px] font-light leading-[21.6px]">Back</span>
            </button>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-[23px] font-semibold leading-[30px] text-vess-grey-950">
                Edit Test
              </h1>
              <p className="text-[13px] font-light leading-[18px] text-vess-grey-950">
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
                          className="w-full bg-transparent text-[13px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
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
                          className="w-full resize-none bg-transparent text-[13px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              <TestConfigureDeviceFormField
                control={form.control}
                name="sourceDevice"
                label="Source Device"
                devices={devices}
                isLoading={devicesQuery.isPending}
                isError={devicesQuery.isError}
                onCreateDevice={() => navigate('/device-management/register')}
              />

              {showDestinationDevice && (
                <TestConfigureDeviceFormField
                  control={form.control}
                  name="destinationDevice"
                  label="Destination Device"
                  devices={devices}
                  isLoading={devicesQuery.isPending}
                  isError={devicesQuery.isError}
                  onCreateDevice={() => navigate('/device-management/register')}
                />
              )}

              {showDataTesting && (
                <div className="flex w-full flex-col gap-4">
                  <div className="flex flex-wrap items-start gap-1 text-[16px] font-normal leading-[21.6px]">
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
                                className="w-full bg-transparent text-[13px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
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
                            className="w-full resize-none bg-transparent text-[13px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
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
                className="inline-flex h-full w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 text-[13px] font-medium leading-[18px] text-vess-grey-950"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-50 disabled:opacity-50"
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
