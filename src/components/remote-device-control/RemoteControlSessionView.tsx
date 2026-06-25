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
import type { ApiRemoteControlSession } from '@/types/device'
import type { RemoteControlDevice } from '@/types/remote-device-control'
import { cn } from '@/lib/utils'

const QUALITY_OPTIONS = ['High Quality', 'Medium Quality', 'Low Quality'] as const

const QUICK_ACTION_COMMANDS = {
  'Reboot Device': 'reboot',
  'Clear Cache': 'clear_cache',
  'Update App': 'update_app',
  'Change Settings': 'change_settings',
} as const

type RemoteControlSessionViewProps = {
  device: RemoteControlDevice
  /** Hardware line beside device name (Figma subtitle). */
  modelLabel: string
  session: ApiRemoteControlSession | null
  /** Return to device picker / clear session. */
  onExitSession: () => void
  onSendCommand: (command: string, args?: Record<string, unknown>) => void
  isEnding: boolean
  isCommandPending: boolean
}

export function RemoteControlSessionView({
  device,
  modelLabel,
  session,
  onExitSession,
  onSendCommand,
  isEnding,
  isCommandPending,
}: RemoteControlSessionViewProps) {
  const [quality, setQuality] = useState<string>(QUALITY_OPTIONS[0])

  const signalDisplay = device.signal === 'N/A' ? '—' : device.signal
  const sessionStatus = session?.status ?? 'active'
  const sessionChannel = session?.channel ?? '—'
  const expiresLabel =
    session?.expires_at ? new Date(session.expires_at).toLocaleString() : '—'

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-100 px-4 py-6 md:px-5">
      <button
        type="button"
        onClick={onExitSession}
        className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
      >
        <ArrowBackIcon className="size-6" />
        <span className="text-[16px] font-light leading-[21.6px]">Back</span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-vess-grey-50 p-4">
        <div className="flex min-w-0 max-w-[708px] flex-wrap items-center gap-5">
          <DeviceTabletIcon className="size-[34px] shrink-0 text-vess-grey-950" />
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-3 text-vess-grey-950">
              <h1 className="text-[23px] font-semibold leading-[30px]">{device.name}</h1>
              <p className="text-[13px] font-light leading-[18px]">{modelLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex items-center gap-1.5 rounded-lg text-[13px] font-light leading-[18px] text-vess-grey-950">
                <BatteryOutlineIcon className="size-4 shrink-0" />
                {device.battery}%
              </span>
              <span className="flex items-center gap-1.5 rounded-lg text-[13px] font-light leading-[18px] text-vess-grey-950">
                <SignalBarsIcon className="size-4 shrink-0" />
                {signalDisplay}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg text-[13px] font-light leading-[18px] text-vess-grey-950">
                <Signal className="size-4 shrink-0" />
                {device.network}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3 rounded-lg">
            <span className="text-[13px] font-light leading-[18px] text-vess-grey-950">Session:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium leading-[18px] text-vess-green-500">
                {sessionStatus}
              </span>
              <span className="size-2 shrink-0 rounded-full bg-vess-green-500" aria-hidden />
            </div>
          </div>
          <button
            type="button"
            disabled={isEnding}
            onClick={onExitSession}
            className="rounded-lg bg-vess-red-500 px-6 py-3 text-[13px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnding ? 'Ending…' : 'End Session'}
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
                  <span className="px-4 text-center text-[11px] font-normal leading-[15.6px] text-vess-grey-500">
                    Mirror preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ToolbarIconButton
                label="Keyboard"
                disabled={isCommandPending}
                onClick={() => onSendCommand('keyboard')}
              >
                <RemoteKeyboardIcon className="size-[30px]" />
              </ToolbarIconButton>
              <ToolbarIconButton
                label="Home"
                disabled={isCommandPending}
                onClick={() => onSendCommand('home')}
              >
                <RemoteHomeIcon className="size-[25px]" />
              </ToolbarIconButton>
              <ToolbarIconButton
                label="Settings"
                disabled={isCommandPending}
                onClick={() => onSendCommand('settings')}
              >
                <RemoteToolbarSettingsIcon className="size-[25px]" />
              </ToolbarIconButton>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isCommandPending}
                onClick={() => onSendCommand('screenshot')}
                className="inline-flex h-[45px] items-center justify-center gap-1.5 rounded-lg bg-vess-grey-100 px-3 text-[13px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RemoteScreenshotIcon className="size-[25px] shrink-0" />
                Screenshot
              </button>
              <button
                type="button"
                disabled={isCommandPending}
                onClick={() => onSendCommand('record')}
                className="inline-flex h-[45px] items-center justify-center gap-1.5 rounded-lg bg-vess-grey-100 px-3 text-[13px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RemoteRecordIcon className="size-[25px] shrink-0" />
                Record
              </button>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger
                  aria-label="Stream quality"
                  className="h-[45px] w-[180px] gap-2 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 text-[13px] font-normal leading-[18px] text-vess-grey-950 shadow-none"
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
              <ManualTestButton
                label="Initiate Call Test"
                command="initiate_call_test"
                tone="primary"
                disabled={isCommandPending}
                onSendCommand={onSendCommand}
              />
              <ManualTestButton
                label="Send SMS test"
                command="send_sms_test"
                tone="secondary"
                disabled={isCommandPending}
                onSendCommand={onSendCommand}
              />
              <ManualTestButton
                label="Data Connection Test"
                command="data_connection_test"
                tone="green"
                disabled={isCommandPending}
                onSendCommand={onSendCommand}
              />
            </div>
          </SessionCard>

          <SessionCard title="Quick Actions">
            <div className="flex flex-col gap-4">
              {(
                Object.entries(QUICK_ACTION_COMMANDS) as [string, string][]
              ).map(([label, command]) => (
                <button
                  key={command}
                  type="button"
                  disabled={isCommandPending}
                  onClick={() => onSendCommand(command)}
                  className="w-full rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-6 py-3 text-[13px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {label}
                </button>
              ))}
            </div>
          </SessionCard>

          <SessionCard title="Connection Info">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <span className="w-[135px] text-[16px] font-light leading-[21.6px] text-vess-grey-950">
                  Status
                </span>
                <span className="inline-flex min-w-[102px] justify-center rounded-full bg-vess-green-50 px-3 py-1 text-[13px] font-normal leading-[18px] text-vess-green-500">
                  {sessionStatus}
                </span>
              </div>
              <ConnectionRow label="Channel" value={sessionChannel} />
              <ConnectionRow label="Expires" value={expiresLabel} />
              <ConnectionRow label="Session ID" value={session?.session_id ?? '—'} />
            </div>
          </SessionCard>

          <SessionCard title="Device Logs">
            <div className="rounded-lg bg-vess-grey-950 p-3">
              <div className="flex flex-col gap-4 font-light leading-[18px]">
                <p className="text-[13px] text-vess-green-500">
                  [{new Date().toLocaleTimeString()}] Remote control session active
                </p>
                {session?.reason ?
                  <p className="text-[13px] text-vess-green-500">
                    [{new Date().toLocaleTimeString()}] {session.reason}
                  </p>
                : null}
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
      <h2 className="text-[18px] font-medium leading-6 text-vess-grey-950">{title}</h2>
      {children}
    </section>
  )
}

function ConnectionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[16px] text-vess-grey-950">
      <span className="max-w-[154px] font-light leading-[21.6px]">{label}</span>
      <span className="whitespace-nowrap font-medium leading-[21.6px]">{value}</span>
    </div>
  )
}

function ManualTestButton({
  label,
  command,
  tone,
  disabled,
  onSendCommand,
}: {
  label: string
  command: string
  tone: 'primary' | 'secondary' | 'green'
  disabled: boolean
  onSendCommand: (command: string) => void
}) {
  const toneClass =
    tone === 'primary' ? 'bg-vess-primary-500'
    : tone === 'secondary' ? 'bg-vess-secondary-500'
    : 'bg-vess-green-500'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSendCommand(command)}
      className={cn(
        'w-full rounded-lg px-6 py-3 text-[13px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
        toneClass,
      )}
    >
      {label}
    </button>
  )
}

function ToolbarIconButton({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-[45px] items-center justify-center rounded-lg bg-vess-grey-100 p-2 text-vess-grey-950 transition-colors hover:bg-vess-grey-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  )
}
