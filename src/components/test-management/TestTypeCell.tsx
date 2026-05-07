import { CallIcon, DataIcon, SmsIcon } from '@/components/icons'
import { type TestType } from '@/data/mock'
import { cn } from '@/lib/utils'

type TestTypeCellProps = {
  type: TestType
  className?: string
}

const typeIcons = {
  Call: CallIcon,
  SMS: SmsIcon,
  Data: DataIcon,
} as const

const typeToneClasses: Record<TestType, string> = {
  Call: 'text-vess-green-800',
  SMS: 'text-vess-secondary-500',
  Data: 'text-vess-green-500',
}

export function TestTypeCell({ type, className }: TestTypeCellProps) {
  const Icon = typeIcons[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[15px] font-normal leading-[18px]',
        typeToneClasses[type],
        className,
      )}
    >
      <Icon className="size-[18px]" />
      <span>{type}</span>
    </span>
  )
}
