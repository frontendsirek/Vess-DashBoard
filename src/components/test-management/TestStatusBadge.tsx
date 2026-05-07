import { type TestStatus } from '@/data/mock'
import { cn } from '@/lib/utils'

type TestStatusBadgeProps = {
  status: TestStatus
  className?: string
}

const statusClasses: Record<TestStatus, string> = {
  Running: 'bg-vess-primary-50 text-vess-primary-500',
  Scheduled: 'bg-vess-secondary-50 text-vess-secondary-500',
  Completed: 'bg-vess-green-50 text-vess-green-800',
}

export function TestStatusBadge({ status, className }: TestStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-[13px] font-medium leading-[15.6px]',
        statusClasses[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
