import { TrendDownIcon, TrendUpIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type DeltaPillProps = {
  value: string
  direction: 'up' | 'down'
  tone: 'green' | 'red'
}

export function DeltaPill({ value, direction, tone }: DeltaPillProps) {
  const Icon = direction === 'up' ? TrendUpIcon : TrendDownIcon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1 py-px',
        tone === 'green' ? 'bg-vess-green-50 text-vess-green-800' : 'bg-vess-red-50 text-vess-red-800',
      )}
    >
      <Icon className="size-[18px]" />
      <span className="text-[13px] font-normal leading-[15.6px]">{value}</span>
    </span>
  )
}
