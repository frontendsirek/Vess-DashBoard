import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  ArrowBackIcon,
  BatteryOutlineIcon,
  Signal,
  DeviceTabletIcon,
  RemoteHomeIcon,
  RemoteKeyboardIcon,
  RemoteRecordIcon,
  RemoteScreenshotIcon,
  RemoteToolbarSettingsIcon,
  SignalBarsIcon,
} from '@/components/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RemoteControlDevice } from '@/types/remote-device-control'
import { cn } from '@/lib/utils'

const QUALITY_OPTIONS = ['High Quality', 'Medium Quality', 'Low Quality'] as const

/** Figma 464:14114 — session console copy. */
const REMOTE_CONSOLE_LINES = [
  '[12:34:56] Connected to device',
  '[12:34:57] Screen mirroring started',
  '[12:34:58] Device ready for remote control',
  '[16:31:24] Screen refreshed',
  '[16:31:24] Screen refreshed',
] as const

const HEADER_LATENCY_MS = '145ms'
const SIDEBAR_LATENCY_MS = '134ms'

type RemoteControlSessionViewProps = {
  device: RemoteControlDevice
  /** Hardware line beside device name (Figma subtitle). */
  modelLabel: string
  /** Return to device picker / clear session. */
  onExitSession: () => void
}

export function RemoteControlSessionView({
  device,
  modelLabel,
  onExitSession,
}: RemoteControlSessionViewProps) {
  const [quality, setQuality] = useState<string>(QUALITY_OPTIONS[0])

  const signalDisplay = device.signal === 'N/A' ? '—' : device.signal

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-100 px-4 py-6 md:px-5">
      <button
        type="button"
        onClick={onExitSession}
        className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
      >
        <ArrowBackIcon className="size-6" />
        <span className="text-[18px] font-light leading-[21.6px]">Back</span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-vess-grey-50 p-4">
        <div className="flex min-w-0 max-w-[708px] flex-wrap items-center gap-5">
          <DeviceTabletIcon className="size-[34px] shrink-0 text-vess-grey-950" />
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-3 text-vess-grey-950">
              <h1 className="text-[25px] font-semibold leading-[30px]">{device.name}</h1>
              <p className="text-[15px] font-light leading-[18px]">{modelLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex items-center gap-1.5 rounded-lg text-[15px] font-light leading-[18px] text-vess-grey-950">
                <BatteryOutlineIcon className="size-4 shrink-0" />
                {device.battery}%
              </span>
              <span className="flex items-center gap-1.5 rounded-lg text-[15px] font-light leading-[18px] text-vess-grey-950">
                <SignalBarsIcon className="size-4 shrink-0" />
                {signalDisplay}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg text-[15px] font-light leading-[18px] text-vess-grey-950">
                <Signal className="size-4 shrink-0" />
                {device.network}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3 rounded-lg">
            <span className="text-[15px] font-light leading-[18px] text-vess-grey-950">Latency:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-medium leading-[18px] text-vess-green-500">
                {HEADER_LATENCY_MS}
              </span>
              <span className="size-2 shrink-0 rounded-full bg-vess-green-500" aria-hidden />
            </div>
          </div>
          <button
            type="button"
            onClick={onExitSession}
            className="rounded-lg bg-vess-red-500 px-6 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5">
          <div className="flex justify-center rounded-2xl bg-vess-primary-500 py-6">
            <div
              className={cn(
                'relative w-[min(296px,85vw)] max-w-[296px]',
                'aspect-[296/607] shrink-0',
              )}
            >
              <div className="absolute inset-0 rounded-[2rem] bg-vess-grey-800 p-[6px] shadow-lg">
                <div className="absolute left-1/2 top-[8px] z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-vess-grey-950/40" />
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-vess-grey-100">
                  <span className="px-4 text-center text-[13px] font-normal leading-[15.6px] text-vess-grey-500">
                    Mirror preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ToolbarIconButton label="Keyboard">
                <RemoteKeyboardIcon className="size-[30px]" />
              </ToolbarIconButton>
              <ToolbarIconButton label="Home">
                <RemoteHomeIcon className="size-[25px]" />
              </ToolbarIconButton>
              <ToolbarIconButton label="Settings">
                <RemoteToolbarSettingsIcon className="size-[25px]" />
              </ToolbarIconButton>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex h-[45px] items-center justify-center gap-1.5 rounded-lg bg-vess-grey-100 px-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-200"
              >
                <RemoteScreenshotIcon className="size-[25px] shrink-0" />
                Screenshot
              </button>
              <button
                type="button"
                className="inline-flex h-[45px] items-center justify-center gap-1.5 rounded-lg bg-vess-grey-100 px-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-200"
              >
                <RemoteRecordIcon className="size-[25px] shrink-0" />
                Record
              </button>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger
                  aria-label="Stream quality"
                  className="h-[45px] w-[180px] gap-2 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 text-[15px] font-normal leading-[18px] text-vess-grey-950 shadow-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-[354px]">
          <SessionCard title="Manual Tests">
            <div className="flex flex-col gap-4">
              <button
                type="button"
                className="w-full rounded-lg bg-vess-primary-500 px-6 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
              >
                Initiate Call Test
              </button>
              <button
                type="button"
                className="w-full rounded-lg bg-vess-secondary-500 px-6 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
              >
                Send SMS test
              </button>
              <button
                type="button"
                className="w-full rounded-lg bg-vess-green-500 px-6 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
              >
                Data Connection Test
              </button>
            </div>
          </SessionCard>

          <SessionCard title="Quick Actions">
            <div className="flex flex-col gap-4">
              {(
                ['Reboot Device', 'Clear Cache', 'Update App', 'Change Settings'] as const
              ).map((label) => (
                <button
                  key={label}
                  type="button"
                  className="w-full rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-6 py-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
                >
                  {label}
                </button>
              ))}
            </div>
          </SessionCard>

          <SessionCard title="Connection Info">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <span className="w-[135px] text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                  Status
                </span>
                <span className="inline-flex min-w-[102px] justify-center rounded-full bg-vess-green-50 px-3 py-1 text-[15px] font-normal leading-[18px] text-vess-green-500">
                  Connected
                </span>
              </div>
              <ConnectionRow label="Latency" value={SIDEBAR_LATENCY_MS} />
              <ConnectionRow label="Frame Rate" value="28 fps" />
              <ConnectionRow label="Bandwidth" value="2.4 Mbps" />
            </div>
          </SessionCard>

          <SessionCard title="Device Logs">
            <div className="rounded-lg bg-vess-grey-950 p-3">
              <div className="flex flex-col gap-4 font-light leading-[18px]">
                {REMOTE_CONSOLE_LINES.map((line, index) => (
                  <p key={`${index}-${line}`} className="text-[15px] text-vess-green-500">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </SessionCard>
        </aside>
      </div>
    </div>
  )
}

function SessionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-lg bg-vess-grey-50 px-4 py-5">
      <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">{title}</h2>
      {children}
    </section>
  )
}

function ConnectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[18px] text-vess-grey-950">
      <span className="max-w-[154px] font-light leading-[21.6px]">{label}</span>
      <span className="whitespace-nowrap font-medium leading-[21.6px]">{value}</span>
    </div>
  )
}

function ToolbarIconButton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex size-[45px] items-center justify-center rounded-lg bg-vess-grey-100 p-2 text-vess-grey-950 transition-colors hover:bg-vess-grey-200"
    >
      {children}
    </button>
  )
}
