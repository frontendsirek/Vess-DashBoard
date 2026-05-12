import { WarningOutlineIcon } from '@/components/icons'
import type { ActiveExecutionRow } from '@/data/real-time-monitoring'
import { activeExecutionRunningCount } from '@/data/real-time-monitoring'
import { cn } from '@/lib/utils'

type ActiveTestExecutionCardProps = {
  rows: ActiveExecutionRow[]
}

export function ActiveTestExecutionCard({ rows }: ActiveTestExecutionCardProps) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Active Test Execution</h2>
        <span className="inline-flex shrink-0 rounded-full bg-vess-green-50 px-3 py-1.5 text-[15px] font-normal leading-[18px] text-vess-green-900">
          {activeExecutionRunningCount} running
        </span>
      </header>

      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-2xl border border-vess-grey-200 bg-vess-grey-50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-[7px] shrink-0 rounded-full',
                    row.status === 'ok' ? 'bg-vess-primary-400' : 'bg-vess-red-500',
                  )}
                  aria-hidden
                />
                <p className="text-[15px] font-medium leading-[18px] text-vess-grey-950">{row.title}</p>
              </div>
              <p className="text-[10px] font-light leading-3 tracking-[0.4px] text-vess-grey-950">{row.percent}%</p>
            </div>

            <div className="mt-3 h-[7px] w-full overflow-hidden rounded bg-vess-grey-100">
              <div
                className={cn(
                  'h-full rounded',
                  row.status === 'ok' ? 'bg-vess-primary-400' : 'bg-vess-red-500',
                )}
                style={{ width: `${row.percent}%` }}
              />
            </div>

            <div className="mt-3 flex flex-col gap-1">
              <div className="flex w-full items-center justify-between gap-2 text-[10px] font-light leading-3 tracking-[0.4px] whitespace-nowrap">
                <p className="min-w-0 shrink text-vess-grey-950">{row.elapsedLabel}</p>
                <p
                  className={cn(
                    'shrink-0',
                    row.status === 'ok' ? 'text-vess-grey-950' : 'text-vess-red-500',
                  )}
                >
                  {row.signalLabel}
                </p>
              </div>
              {row.warningMessage && (
                <p className="flex items-start gap-1.5 text-[10px] font-light leading-3 tracking-[0.4px] text-vess-red-500">
                  <WarningOutlineIcon className="mt-0.5 size-[11px] shrink-0 text-vess-red-500" aria-hidden />
                  {row.warningMessage}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
