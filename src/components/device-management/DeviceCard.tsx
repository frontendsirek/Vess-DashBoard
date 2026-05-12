import { EyeIcon } from '@/components/icons'
import { DeviceStatusDot } from '@/components/device-management/DeviceStatusDot'
import { ManagementCardRow } from '@/components/shared/ManagementCardRow'
import {
  deviceShowsLowBatteryTag,
  formatDeviceNetworkDisplay,
  type DeviceRecord,
} from '@/data/device-management'
import { cn } from '@/lib/utils'

type DeviceCardProps = {
  device: DeviceRecord
  onView?: (device: DeviceRecord) => void
}

/** Grid card shell aligned with TestCard + Figma 708:22402 (device-specific labels). */
export function DeviceCard({ device, onView }: DeviceCardProps) {
  const lowBattery = deviceShowsLowBatteryTag(device)

  return (
    <article className="flex flex-col rounded-2xl border border-vess-grey-100 bg-vess-grey-50">
      <header className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-medium leading-[18px] text-vess-grey-950">{device.name}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-vess-grey-100 px-1.5 py-1 text-[13px] font-normal leading-[15.6px] text-vess-grey-500">
                {device.badgePrimary}
              </span>
              {device.badgeSecondary && (
                <span className="rounded-lg bg-vess-grey-100 px-1.5 py-1 text-[13px] font-normal leading-[15.6px] text-vess-grey-500">
                  {device.badgeSecondary}
                </span>
              )}
            </div>
          </div>
          <DeviceStatusDot status={device.status} />
        </div>
      </header>

      <dl className="flex flex-col gap-3 px-4 py-4 text-[15px] leading-[18px]">
        <ManagementCardRow label="Battery">
          <span className="inline-flex flex-wrap items-center justify-end gap-2">
            <span
              className={cn(
                'tabular-nums',
                lowBattery && 'font-medium text-vess-red-500',
              )}
            >
              {device.batteryPercent}%
            </span>
            {lowBattery && (
              <span className="rounded-md bg-vess-red-50 px-2 py-0.5 text-[12px] font-medium text-vess-red-500">
                Low
              </span>
            )}
          </span>
        </ManagementCardRow>
        <ManagementCardRow label="Network">
          <span>{formatDeviceNetworkDisplay(device)}</span>
        </ManagementCardRow>
        <ManagementCardRow label="Last seen">
          <span>{device.lastSeen}</span>
        </ManagementCardRow>
      </dl>

      <div className="flex items-center justify-between mx-4 border-t border-vess-grey-100 px-4 py-3 text-[15px] leading-[18px]">
        <span className="font-normal text-vess-grey-500">Action</span>
        <button
          type="button"
          onClick={() => onView?.(device)}
          className="inline-flex items-center gap-1.5 text-vess-grey-950 transition-colors hover:text-vess-primary-500"
        >
          <EyeIcon className="size-[18px]" />
          <span>View</span>
        </button>
      </div>
    </article>
  )
}
