import { ChevronRightIcon, CloseIcon } from '@/components/icons'
import { type AlertTone, type RecentAlert, recentAlerts } from '@/data/mock'
import { cn } from '@/lib/utils'

const toneBgClasses: Record<AlertTone, string> = {
  red: 'bg-vess-red-50/50',
  amber: 'bg-vess-secondary-50/50',
  navy: 'bg-vess-primary-50/50',
}

const toneDotClasses: Record<AlertTone, string> = {
  red: 'bg-vess-red-500',
  amber: 'bg-vess-secondary-500',
  navy: 'bg-vess-primary-500',
}

const toneTitleClasses: Record<AlertTone, string> = {
  red: 'text-vess-red-500',
  amber: 'text-vess-secondary-500',
  navy: 'text-vess-primary-500',
}

export function RecentAlertsCard() {
  return (
    <section className="flex h-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-[18px] font-medium leading-6 text-vess-grey-950">
          Recent Alerts
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full py-1.5 text-[13px] font-normal leading-[18px] text-vess-primary-500 transition-colors hover:text-vess-primary-400"
        >
          View all
          <ChevronRightIcon className="size-5" />
        </button>
      </header>

      <div className="flex flex-col gap-6">
        {recentAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </section>
  )
}

function AlertItem({ alert }: { alert: RecentAlert }) {
  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl px-4 py-3',
        toneBgClasses[alert.tone],
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn('mt-1.5 size-[7px] shrink-0 rounded-full', toneDotClasses[alert.tone])}
          aria-hidden
        />
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <p
                  className={cn(
                    'text-[13px] font-semibold leading-[18px]',
                    toneTitleClasses[alert.tone],
                  )}
                >
                  {alert.title}
                </p>
                {alert.ack && (
                  <span className="text-[10px] font-light leading-3 tracking-[0.4px] text-vess-grey-950">
                    ACK
                  </span>
                )}
              </div>
              <p className="text-[11px] font-light leading-[15.6px] text-vess-grey-950">
                {alert.body}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Dismiss ${alert.title}`}
              className="size-4 shrink-0 text-vess-grey-500 transition-colors hover:text-vess-grey-950"
            >
              <CloseIcon className="size-full" />
            </button>
          </div>
          <p className="text-[10px] font-light leading-3 tracking-[0.4px] text-vess-grey-800">
            {alert.timestamp}
          </p>
        </div>
      </div>
    </article>
  )
}
