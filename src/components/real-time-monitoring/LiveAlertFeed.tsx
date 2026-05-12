import { useState } from 'react'
import { ArrowRightIcon, CloseIcon } from '@/components/icons'
import type { MonitoringAlert } from '@/data/real-time-monitoring'
import { monitoringAlerts } from '@/data/real-time-monitoring'
import { cn } from '@/lib/utils'

/** Figma 708:25877 — flat tinted cards, no stroke. */
const severityBg: Record<MonitoringAlert['severity'], string> = {
  high: 'bg-vess-red-50/50',
  medium: 'bg-vess-secondary-50/50',
}

const severityDot: Record<MonitoringAlert['severity'], string> = {
  high: 'bg-vess-red-500',
  medium: 'bg-vess-secondary-500',
}

const severityTitle: Record<MonitoringAlert['severity'], string> = {
  high: 'text-vess-red-500',
  medium: 'text-vess-secondary-500',
}

/** High-severity cards use grey-800 timestamps; medium use grey-950 (Figma). */
const timeAgoClass: Record<MonitoringAlert['severity'], string> = {
  high: 'text-vess-grey-800',
  medium: 'text-vess-grey-950',
}

const acknowledgePill: Record<MonitoringAlert['severity'], string> = {
  high: 'bg-vess-red-50 text-vess-red-500',
  medium: 'bg-vess-secondary-50 text-vess-secondary-500',
}

export function LiveAlertFeed() {
  const [alerts, setAlerts] = useState(monitoringAlerts)

  function clearAll() {
    setAlerts([])
  }

  function dismiss(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <section className="flex flex-col gap-8 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
      <header className="flex h-9 min-h-[36px] items-center justify-between gap-3">
        <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Live Alert Feed</h2>
        <button
          type="button"
          onClick={clearAll}
          className="shrink-0 rounded-full bg-vess-grey-100 px-3 py-1.5 text-[15px] font-normal leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-200"
        >
          Clear all
        </button>
      </header>

      <div className="flex flex-col gap-6">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={cn('rounded-2xl px-4 py-3', severityBg[alert.severity])}
          >
            <div className="flex gap-3 items-start">
              <div className="flex w-[7px] shrink-0 justify-center pt-1.5">
                <span
                  className={cn('size-[7px] shrink-0 rounded-full', severityDot[alert.severity])}
                  aria-hidden
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex gap-3 items-start">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p
                        className={cn(
                          'text-[15px] font-semibold leading-[18px]',
                          severityTitle[alert.severity],
                        )}
                      >
                        {alert.title}
                      </p>
                      <p
                        className={cn(
                          'text-[10px] font-light leading-3 tracking-[0.4px]',
                          timeAgoClass[alert.severity],
                        )}
                      >
                        {alert.timeAgo}
                      </p>
                    </div>
                    <p className="text-[13px] font-light leading-[15.6px] text-vess-grey-950">
                      {alert.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Dismiss ${alert.title}`}
                    className="size-4 shrink-0 text-vess-grey-500 transition-colors hover:text-vess-grey-950"
                    onClick={() => dismiss(alert.id)}
                  >
                    <CloseIcon className="size-full" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={cn(
                      'rounded-lg px-5 py-1.5 text-[13px] font-normal leading-[15.6px]',
                      acknowledgePill[alert.severity],
                    )}
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full py-1.5 pl-0 pr-0 text-[13px] font-normal leading-[15.6px] text-vess-primary-500 transition-colors hover:text-vess-primary-400"
                  >
                    View details
                    <ArrowRightIcon className="size-[17px] shrink-0" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {alerts.length === 0 && (
          <p className="text-[13px] font-light text-vess-grey-500">No active alerts.</p>
        )}
      </div>
    </section>
  )
}
