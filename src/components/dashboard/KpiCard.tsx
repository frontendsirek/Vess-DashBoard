import { type ComponentType, type SVGProps, type ReactNode } from 'react'
import { DeltaPill } from '@/components/dashboard/DeltaPill'
import { cn } from '@/lib/utils'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

type KpiCardProps = {
  label: string
  value: ReactNode
  suffix?: ReactNode
  icon: IconComponent
  iconBg: 'navy' | 'green' | 'amber' | 'red'
  delta?: {
    value: string
    direction: 'up' | 'down'
    tone: 'green' | 'red'
    caption?: string
  }
}

const iconBgClasses: Record<NonNullable<KpiCardProps['iconBg']>, string> = {
  navy: 'bg-vess-primary-50 text-vess-primary-500',
  green: 'bg-vess-green-50 text-vess-green-800',
  amber: 'bg-vess-secondary-50 text-vess-secondary-500',
  red: 'bg-vess-red-50 text-vess-red-800',
}

export function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  iconBg,
  delta,
}: KpiCardProps) {
  return (
    <article className="flex flex-1 flex-col gap-5 rounded-2xl bg-vess-grey-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3 text-vess-grey-950">
          <p className="text-[13px] font-normal leading-[18px]">{label}</p>
          <div className="flex items-end gap-1">
            <span className="text-[29px] font-medium leading-[37.2px]">{value}</span>
            {suffix && (
              <span className="text-[11px] font-normal leading-[15.6px] text-vess-grey-400">
                {suffix}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'flex size-[60px] shrink-0 items-center justify-center rounded-full',
            iconBgClasses[iconBg],
          )}
        >
          <Icon className="size-[30px]" />
        </div>
      </div>
      {delta && (
        <div className="flex items-center gap-1">
          <DeltaPill value={delta.value} direction={delta.direction} tone={delta.tone} />
          <p className="text-[11px] font-normal leading-[15.6px] text-vess-grey-400">
            {delta.caption ?? 'vs last hours'}
          </p>
        </div>
      )}
    </article>
  )
}
