import type { ReactNode } from 'react'
import { monitoringSummary } from '@/data/real-time-monitoring'
import { cn } from '@/lib/utils'
import { LiveIcon } from '@/components/icons'

export function MonitoringSummaryStrip() {
  const { activeTests, deviceOnline, successRate, openAlerts } = monitoringSummary

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-vess-primary-500 px-4 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[31px] font-medium leading-[37.2px] text-vess-grey-50">
          Real-time Monitoring
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-vess-grey-50">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-vess-green-500 px-3 py-1.5 text-[15px] font-medium leading-none text-vess-grey-50">
            <LiveIcon className="size-4 shrink-0" aria-hidden />
            Live
          </span>
          <span className="hidden h-6 w-px bg-vess-primary-300 sm:block" aria-hidden />
          <p className="text-[15px] font-normal leading-[18px]">Auto-refresh: ON</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Active Tests"
          value={activeTests.value}
          footer={
            <p className={cn('text-[13px] font-normal leading-[15.6px]', deltaClass(activeTests.deltaTone))}>
              {activeTests.delta}
            </p>
          }
        />
        <KpiTile
          label="Device Online"
          value={deviceOnline.value}
          footer={
            <p className="flex flex-wrap gap-x-2 text-[13px] font-normal leading-[15.6px]">
              {deviceOnline.segments.map((s) => (
                <span
                  key={s.text}
                  className={cn(
                    s.tone === 'red' && 'text-vess-red-500',
                    s.tone === 'secondary' && 'text-vess-secondary-500',
                  )}
                >
                  {s.text}
                </span>
              ))}
            </p>
          }
        />
        <KpiTile
          label="Success Rate"
          value={successRate.value}
          footer={
            <p className={cn('text-[13px] font-normal leading-[15.6px]', deltaClass(successRate.deltaTone))}>
              {successRate.delta}
            </p>
          }
        />
        <KpiTile
          label="Open Alerts"
          value={openAlerts.value}
          footer={
            <p className={cn('text-[13px] font-normal leading-[15.6px]', deltaClass(openAlerts.deltaTone))}>
              {openAlerts.delta}
            </p>
          }
        />
      </div>
    </section>
  )
}

function KpiTile({
  label,
  value,
  footer,
}: {
  label: string
  value: string
  footer: ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-vess-primary-300 bg-vess-primary-400 p-4">
      <p className="text-[15px] font-normal leading-[18px] text-vess-grey-50">{label}</p>
      <p className="text-[31px] font-medium leading-[37.2px] text-vess-grey-50">{value}</p>
      {footer}
    </div>
  )
}

function deltaClass(tone: 'green' | 'red') {
  return tone === 'green' ? 'text-vess-green-500' : 'text-vess-red-500'
}
