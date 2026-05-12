import type { ComponentType } from 'react'
import {
  DeviceIconM,
  DeviceKpiBatteryIcon,
  DeviceKpiOfflineIcon,
  DeviceKpiWifiIcon,
} from '@/components/icons'
import { deviceKpiSummary } from '@/data/device-management'
import { cn } from '@/lib/utils'

export function DeviceKpiStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiMiniTile
        label="Total Devices"
        value={String(deviceKpiSummary.total)}
        icon={DeviceIconM}
        wellClassName="bg-vess-primary-50"
        iconClassName="size-[35px]"
      />
      <KpiMiniTile
        label="Online"
        value={String(deviceKpiSummary.online)}
        icon={DeviceKpiWifiIcon}
        wellClassName="bg-vess-green-50"
        iconClassName="size-[30px] text-vess-green-500"
      />
      <KpiMiniTile
        label="Offline"
        value={String(deviceKpiSummary.offline)}
        icon={DeviceKpiOfflineIcon}
        wellClassName="bg-vess-red-50"
        iconClassName="size-[30px] text-vess-red-500"
      />
      <KpiMiniTile
        label="Low Battery"
        value={String(deviceKpiSummary.lowBattery)}
        icon={DeviceKpiBatteryIcon}
        wellClassName="bg-vess-secondary-50"
        iconClassName="size-[30px] text-vess-secondary-500"
      />
    </div>
  )
}

function KpiMiniTile({
  label,
  value,
  icon: Icon,
  wellClassName,
  iconClassName,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  wellClassName: string
  iconClassName: string
}) {
  return (
    <div className="rounded-2xl bg-vess-grey-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-5">
          <p className="text-[15px] font-normal leading-[18px] text-vess-grey-950">{label}</p>
          <p className="text-[31px] font-medium leading-[37.2px] text-vess-grey-950">{value}</p>
        </div>
        <div
          className={cn(
            'flex size-[60px] shrink-0 items-center justify-center rounded-full text-vess-grey-950',
            wellClassName,
          )}
        >
          <Icon className={iconClassName} />
        </div>
      </div>
    </div>
  )
}
