import type { DeviceLogEntry, DeviceLogLevel } from '@/data/device-management'
import { cn } from '@/lib/utils'

function logLevelMeta(level: DeviceLogLevel): {
  rowClass: string
  timeClass: string
  messageClass: string
} {
  switch (level) {
    case 'INFO':
      return {
        rowClass: 'border-vess-primary-500 bg-vess-primary-50',
        timeClass: 'text-vess-primary-500',
        messageClass: 'text-vess-primary-500',
      }
    case 'DEBUG':
      return {
        rowClass: 'border-vess-grey-200 bg-vess-grey-100',
        timeClass: 'text-vess-grey-500',
        messageClass: 'text-vess-grey-950',
      }
    case 'WARNING':
      return {
        rowClass: 'border-vess-secondary-500 bg-vess-secondary-50',
        timeClass: 'text-vess-secondary-500',
        messageClass: 'text-vess-secondary-500',
      }
    case 'ERROR':
      return {
        rowClass: 'border-vess-red-500 bg-vess-red-50',
        timeClass: 'text-vess-red-500',
        messageClass: 'text-vess-red-500',
      }
  }
}

function LogChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-lg border border-vess-grey-200 px-1.5 py-1 text-[10px] font-light leading-3 tracking-[0.4px] text-vess-grey-950">
      {children}
    </span>
  )
}

function LogEntryRow({ entry }: { entry: DeviceLogEntry }) {
  const meta = logLevelMeta(entry.level)

  return (
    <li
      className={cn(
        'flex min-h-[72px] items-center rounded-lg border px-4 py-3',
        meta.rowClass,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              'whitespace-nowrap text-[11px] font-normal leading-[15.6px]',
              meta.timeClass,
            )}
          >
            {entry.timestamp}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <LogChip>{entry.level}</LogChip>
            <LogChip>{entry.category}</LogChip>
          </div>
        </div>
        <p
          className={cn(
            'min-w-0 text-[13px] font-normal leading-[18px] break-words',
            meta.messageClass,
          )}
        >
          {entry.message}
        </p>
      </div>
    </li>
  )
}

export type DeviceLogsListProps = {
  entries: DeviceLogEntry[]
  /** Total rows in the dataset (for “Showing X of Y”). */
  totalInDataset: number
}

export function DeviceLogsList({ entries, totalInDataset }: DeviceLogsListProps) {
  const errorCount = entries.filter((e) => e.level === 'ERROR').length
  const warningCount = entries.filter((e) => e.level === 'WARNING').length

  return (
    <div className="overflow-hidden rounded-lg border-2 border-vess-grey-100">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-vess-grey-100 px-5 py-4">
        <p className="text-[13px] font-normal leading-[18px] text-vess-grey-950">
          Showing {entries.length} of {totalInDataset} log entries
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center justify-center rounded-full bg-vess-red-50 px-3 py-1 text-[13px] font-normal leading-[18px] text-vess-red-500">
            {errorCount} Errors
          </span>
          <span className="inline-flex items-center justify-center rounded-full bg-vess-secondary-50 px-3 py-1 text-[13px] font-normal leading-[18px] text-vess-secondary-500">
            {warningCount} Warnings
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 bg-vess-grey-50 p-4">
        {entries.map((entry) => (
          <LogEntryRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  )
}
