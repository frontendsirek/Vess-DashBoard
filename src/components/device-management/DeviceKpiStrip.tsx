import type { ComponentType } from 'react'
import {
  DeviceIconM,
  DeviceKpiBatteryIcon,
  DeviceKpiOfflineIcon,
  DeviceKpiWifiIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'

/** Fallback before Devices API KPI is available (e.g. signed-out). */
const KPI_PLACEHOLDER_TOTAL = 0

export type DeviceKpiSummaryProps = {
  total: number
  online: number
  offline: number
  /** Fleet warning count from stats API; renders em dash when null */
  warning: number | null
}

type DeviceKpiStripProps = {
  summary?: DeviceKpiSummaryProps
  summaryPending?: boolean
}

export function DeviceKpiStrip({ summary, summaryPending }: DeviceKpiStripProps) {
  const total = summary ? summary.total : KPI_PLACEHOLDER_TOTAL
  const online = summary ? summary.online : KPI_PLACEHOLDER_TOTAL
  const offline = summary ? summary.offline : KPI_PLACEHOLDER_TOTAL
  const warningDisplay =
    summary && summary.warning === null ? '—' : String(summary?.warning ?? KPI_PLACEHOLDER_TOTAL)

  const valueClass = (dimmed: boolean) =>
    cn(
      'text-[31px] font-medium leading-[37.2px] text-vess-grey-950',
      dimmed && 'text-vess-grey-400',
    )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiMiniTile
        label="Total Devices"
        value={summaryPending ? '…' : String(total)}
        valueClassName={valueClass(summaryPending)}
        icon={DeviceIconM}
        wellClassName="bg-vess-primary-50"
        iconClassName="size-[35px]"
      />
      <KpiMiniTile
        label="Online"
        value={summaryPending ? '…' : String(online)}
        valueClassName={valueClass(summaryPending)}
        icon={DeviceKpiWifiIcon}
        wellClassName="bg-vess-green-50"
        iconClassName="size-[30px] text-vess-green-500"
      />
      <KpiMiniTile
        label="Offline"
        value={summaryPending ? '…' : String(offline)}
        valueClassName={valueClass(summaryPending)}
        icon={DeviceKpiOfflineIcon}
        wellClassName="bg-vess-red-50"
        iconClassName="size-[30px] text-vess-red-500"
      />
      <KpiMiniTile
        label="Warning"
        value={summaryPending ? '…' : warningDisplay}
        valueClassName={valueClass(summaryPending)}
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
  valueClassName,
  icon: Icon,
  wellClassName,
  iconClassName,
}: {
  label: string
  value: string
  valueClassName?: string
  icon: ComponentType<{ className?: string }>
  wellClassName: string
  iconClassName: string
}) {
  return (
    <div className="rounded-2xl bg-vess-grey-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-5">
          <p className="text-[15px] font-normal leading-[18px] text-vess-grey-950">{label}</p>
          <p className={valueClassName ?? 'text-[31px] font-medium leading-[37.2px] text-vess-grey-950'}>
            {value}
          </p>
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
