import { LegendDots } from '@/components/dashboard/LegendDots'
import { type DeviceStatus, deviceStatuses } from '@/data/mock'
import { cn } from '@/lib/utils'

const stateClasses: Record<DeviceStatus['state'], string> = {
  online: 'bg-vess-green-500',
  testing: 'bg-vess-secondary-500',
  offline: 'bg-vess-red-500',
}

export function DeviceStatusCard() {
  return (
    <section className="flex h-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex h-9 items-center justify-between">
        <h2 className="text-[18px] font-medium leading-6 text-vess-grey-950">
          Device Status
        </h2>
      </header>

      <div className="flex flex-col gap-6">
        {deviceStatuses.map((device) => (
          <DeviceStatusRow key={device.id} device={device} />
        ))}
      </div>

      <LegendDots
        items={[
          { label: 'Online', tone: 'green' },
          { label: 'Testing', tone: 'amber' },
          { label: 'Offline', tone: 'red' },
        ]}
      />
    </section>
  )
}

function DeviceStatusRow({ device }: { device: DeviceStatus }) {
  const showRedPercent = device.state === 'testing'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn('size-[7px] shrink-0 rounded-full', stateClasses[device.state])}
            aria-hidden
          />
          <p className="text-[13px] font-medium leading-[18px] text-vess-grey-950">
            {device.name}
          </p>
        </div>
        <span
          className={cn(
            'text-[10px] font-light leading-3 tracking-[0.4px]',
            showRedPercent ? 'text-vess-red-500' : 'text-vess-grey-950',
          )}
        >
          {device.uptimePercent}%
        </span>
      </div>
      <div className="flex items-center justify-between pl-[19px] text-[10px] font-light leading-3 tracking-[0.4px] text-vess-grey-950">
        <span>{device.location}</span>
        <span>{device.network}</span>
      </div>
    </div>
  )
}
