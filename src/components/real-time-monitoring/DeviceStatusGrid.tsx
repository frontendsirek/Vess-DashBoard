import {
  BatteryOutlineIcon,
  DeviceIconBlack,
  SignalBarsIcon,
} from '@/components/icons'
import type { MonitoringDevice } from '@/data/real-time-monitoring'
import { monitoringDevices } from '@/data/real-time-monitoring'
import { cn } from '@/lib/utils'

const statusDot: Record<MonitoringDevice['status'], string> = {
  online: 'bg-vess-green-500',
  testing: 'bg-vess-secondary-500',
  offline: 'bg-vess-red-500',
}

const footnote =
  'text-[11px] font-normal leading-3 text-vess-grey-500 tracking-[0.4px]'

export function DeviceStatusGrid() {
  return (
    <section className="flex flex-col gap-8 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
      <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Device Status Grid</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {monitoringDevices.map((device) => (
          <DeviceTile key={device.id} device={device} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
        <Legend label="Online" dotClass="bg-vess-green-500" />
        <Legend label="Testing" dotClass="bg-vess-secondary-500" />
        <Legend label="Offline" dotClass="bg-vess-red-500" />
      </div>
    </section>
  )
}

function DeviceTile({ device }: { device: MonitoringDevice }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 rounded-lg bg-vess-grey-100 p-2">
          <DeviceIconBlack className="size-6 shrink-0" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex h-5 w-full items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[15px] font-normal leading-[18px] text-vess-grey-950">
              {device.name}
            </p>
            <span
              className={cn('size-2 shrink-0 rounded-full', statusDot[device.status])}
              aria-hidden
            />
          </div>
          <p className={footnote}>{device.statusLabel}</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex h-4 items-center gap-1">
          <BatteryOutlineIcon className="size-3 shrink-0 text-vess-grey-500" aria-hidden />
          <span className={footnote}>{device.batteryPercent}%</span>
        </div>
        <div className="flex h-4 items-center gap-1">
          <SignalBarsIcon className="size-3 shrink-0 text-vess-grey-500" aria-hidden />
          <span className={footnote}>{device.signalDisplay}</span>
        </div>
      </div>

      <p className={footnote}>
        Last test: {device.lastTestLabel}
      </p>
    </div>
  )
}

function Legend({ label, dotClass }: { label: string; dotClass: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('size-2.5 shrink-0 rounded-full', dotClass)} aria-hidden />
      <span className="text-[13px] font-medium leading-[15.6px] text-vess-grey-950">{label}</span>
    </div>
  )
}
