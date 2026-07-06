import { type TestStatus } from '@/data/mock'
import { cn } from '@/lib/utils'

type TestStatusBadgeProps = {
  status: TestStatus
  className?: string
}

const statusClasses: Record<TestStatus, string> = {
  Draft: 'bg-vess-grey-100 text-vess-grey-800',
  Ready: 'bg-vess-green-50 text-vess-green-800',
  Running: 'bg-vess-primary-50 text-vess-primary-500',
  'Cancel requested': 'bg-vess-secondary-50 text-vess-secondary-500',
  Canceled: 'bg-vess-red-50 text-vess-red-800',
}

export function TestStatusBadge({ status, className }: TestStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium leading-[15.6px]',
        statusClasses[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
