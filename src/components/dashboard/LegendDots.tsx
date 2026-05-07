import { cn } from '@/lib/utils'

type LegendTone = 'navy' | 'green' | 'red' | 'amber'

type LegendItem = {
  label: string
  tone: LegendTone
}

type LegendDotsProps = {
  items: LegendItem[]
  className?: string
}

const toneClasses: Record<LegendTone, string> = {
  navy: 'bg-vess-primary-500',
  green: 'bg-vess-green-500',
  red: 'bg-vess-red-500',
  amber: 'bg-vess-secondary-500',
}

export function LegendDots({ items, className }: LegendDotsProps) {
  return (
    <div className={cn('flex items-center gap-5', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className={cn('size-[10px] rounded-full', toneClasses[item.tone])}
            aria-hidden
          />
          <span className="text-[13px] font-medium leading-[15.6px] text-vess-grey-950">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
