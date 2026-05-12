import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowBackIcon, ChevronDownIcon } from '@/components/icons'
import { Topbar } from '@/components/layout/Topbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CreateTestConfigureDraft,
  DataTestMethod,
  TestManagementConfigureState,
} from '@/types/create-test'

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

function DeviceField({
  title,
  value,
  onChange,
}: {
  title: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <FieldLabel required>{title}</FieldLabel>
      <div className="flex flex-col gap-1.5">
        <Select
          value={value ? value : NONE}
          onValueChange={(v) => onChange(v === NONE ? '' : v)}
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
    </div>
  )
}

function NumberStepperRow({
  value,
  onIncrement,
  onDecrement,
}: {
  value: number
  onIncrement: () => void
  onDecrement: () => void
}) {
  return (
    <div className="flex h-[50px] w-full items-center justify-between rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
      <span className="text-[15px] font-normal leading-[18px] text-vess-grey-950">{value}</span>
      <div className="flex flex-col">
        <button
          type="button"
          aria-label="Increase value"
          className="flex size-[22px] items-center justify-center text-vess-grey-950"
          onClick={onIncrement}
        >
          <ChevronDownIcon className="size-5 -rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Decrease value"
          className="flex size-[22px] items-center justify-center text-vess-grey-950"
          onClick={onDecrement}
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

  const [testName, setTestName] = useState(restore?.testName ?? '')
  const [description, setDescription] = useState(restore?.description ?? '')
  const [callDuration, setCallDuration] = useState(restore?.callDurationSeconds ?? 60)
  const [sourceDevice, setSourceDevice] = useState(restore?.sourceDevice ?? '')
  const [destinationDevice, setDestinationDevice] = useState(restore?.destinationDevice ?? '')
  const [messageText, setMessageText] = useState(restore?.messageText ?? '')
  const [dataTestMethod, setDataTestMethod] = useState<DataTestMethod>(
    restore?.dataTestMethod ?? 'target-url',
  )
  const [dataTargetValue, setDataTargetValue] = useState(restore?.dataTargetValue ?? '')
  const [payloadSizeKb, setPayloadSizeKb] = useState(restore?.payloadSizeKb ?? 1024)

  useEffect(() => {
    const s = location.state as TestManagementConfigureState | null
    if (!s?.restore) return
    const r = s.restore
    if (r.testName !== undefined) setTestName(r.testName)
    if (r.description !== undefined) setDescription(r.description)
    if (r.callDurationSeconds !== undefined) setCallDuration(r.callDurationSeconds)
    if (r.sourceDevice !== undefined) setSourceDevice(r.sourceDevice)
    if (r.destinationDevice !== undefined) setDestinationDevice(r.destinationDevice)
    if (r.messageText !== undefined) setMessageText(r.messageText)
    if (r.dataTestMethod !== undefined) setDataTestMethod(r.dataTestMethod)
    if (r.dataTargetValue !== undefined) setDataTargetValue(r.dataTargetValue)
    if (r.payloadSizeKb !== undefined) setPayloadSizeKb(r.payloadSizeKb)
  }, [location.key, location.state])

  useEffect(() => {
    if (!step1) {
      navigate('/test-management', { replace: true })
    }
  }, [step1, navigate])

  const configureDraft = useMemo((): CreateTestConfigureDraft | null => {
    if (!step1) return null
    return {
      ...step1,
      testName,
      description,
      sourceDevice,
      destinationDevice: testType === 'Data' ? '' : destinationDevice,
      callDurationSeconds: testType === 'Call' ? callDuration : 0,
      messageText,
      dataTestMethod,
      dataTargetValue,
      payloadSizeKb: testType === 'Data' ? payloadSizeKb : 0,
    }
  }, [
    step1,
    testType,
    testName,
    description,
    callDuration,
    sourceDevice,
    destinationDevice,
    messageText,
    dataTestMethod,
    dataTargetValue,
    payloadSizeKb,
  ])

  if (!step1) return null

  function goBack() {
    navigate(-1)
  }

  function goSchedule() {
    if (!configureDraft) return
    navigate('/test-management/new/schedule', { state: { configure: configureDraft } })
  }

  const showCallDuration = testType === 'Call'
  const showMessageText = testType === 'SMS'
  const showDestinationDevice = testType !== 'Data'
  const showDataTesting = testType === 'Data'

  return (
    <>
      <Topbar title="Test Management" subtitle="Test configuration & results" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5">
          <button
            type="button"
            onClick={goBack}
            className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
          >
            <ArrowBackIcon className="size-6" />
            <span className="text-[18px] font-light leading-[21.6px]">Back</span>
          </button>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">Create New Test</h1>
            <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">
              Step 2 : Configuration
            </p>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-6">
            <div className="flex w-full flex-col gap-3">
              <FieldLabel required>Test Name</FieldLabel>
              <div className="min-h-[50px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3">
                <input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Enter test name"
                  className="w-full bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                />
              </div>
            </div>

            <div className="flex w-full flex-col gap-3">
              <FieldLabel>Description</FieldLabel>
              <div className="min-h-[127px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                  className="w-full resize-none bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                />
              </div>
            </div>

            <DeviceField title="Source Device" value={sourceDevice} onChange={setSourceDevice} />

            {showDestinationDevice && (
              <DeviceField
                title="Destination Device"
                value={destinationDevice}
                onChange={setDestinationDevice}
              />
            )}

            {showDataTesting && (
              <div className="flex w-full flex-col gap-4">
                <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
                  <span className="text-vess-grey-950">Data Testing </span>
                  <span className="text-vess-red-500">*</span>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <SubFieldLabel>Test Method</SubFieldLabel>
                    <Select
                      value={dataTestMethod}
                      onValueChange={(v) => setDataTestMethod(v as DataTestMethod)}
                    >
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
                  </div>
                  <div className="flex flex-col gap-3">
                    <SubFieldLabel>
                      {dataTestMethod === 'ping' ? 'Host / IP Address' : 'Endpoint URL'}
                    </SubFieldLabel>
                    <div className="flex min-h-[50px] items-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3">
                      <input
                        value={dataTargetValue}
                        onChange={(e) => setDataTargetValue(e.target.value)}
                        placeholder={
                          dataTestMethod === 'ping'
                            ? '192.168.1.1'
                            : 'https://api.example.com/v1'
                        }
                        className="w-full bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showDataTesting && (
              <div className="flex w-full flex-col gap-3">
                <FieldLabel>Payload Size (KB)</FieldLabel>
                <NumberStepperRow
                  value={payloadSizeKb}
                  onIncrement={() => setPayloadSizeKb((n) => n + 1)}
                  onDecrement={() => setPayloadSizeKb((n) => Math.max(1, n - 1))}
                />
              </div>
            )}

            {showMessageText && (
              <div className="flex w-full flex-col gap-3">
                <FieldLabel>Message Text</FieldLabel>
                <div className="min-h-[127px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter message"
                    rows={4}
                    className="w-full resize-none bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none"
                  />
                </div>
              </div>
            )}

            {showCallDuration && (
              <div className="flex w-full flex-col gap-3">
                <FieldLabel required>Call Duration (seconds)</FieldLabel>
                <NumberStepperRow
                  value={callDuration}
                  onIncrement={() => setCallDuration((n) => n + 1)}
                  onDecrement={() => setCallDuration((n) => Math.max(1, n - 1))}
                />
              </div>
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
              type="button"
              onClick={goSchedule}
              className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
