import { ChevronDownIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type PeriodSelectorProps = {
  value: string
  onClick?: () => void
  className?: string
}

export function PeriodSelector({ value, onClick, className }: PeriodSelectorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-vess-grey-100 px-3 py-1.5 text-[15px] font-normal leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-200',
        className,
      )}
    >
      <span>{value}</span>
      <ChevronDownIcon className="size-6" />
    </button>
  )
}
