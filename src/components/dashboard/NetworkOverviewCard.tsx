import { useState } from 'react'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { networkOverview, type NetworkOverviewMetric } from '@/data/mock'
import { cn } from '@/lib/utils'

const toneClasses: Record<NetworkOverviewMetric['tone'], string> = {
  navy: 'text-vess-primary-500',
  green: 'text-vess-green-500',
  amber: 'text-vess-secondary-500',
  grey: 'text-vess-grey-500',
  red: 'text-vess-red-500',
}

export function NetworkOverviewCard() {
  const [period, setPeriod] = useState('Today')

  return (
    <section className="flex w-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">
          Network Overview
        </h2>
        <PeriodSelector
          value={period}
          onClick={() => setPeriod((prev) => (prev === 'Today' ? 'This week' : 'Today'))}
        />
      </header>

      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-5 lg:gap-[30px]">
        {networkOverview.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  )
}

function MetricTile({ metric }: { metric: NetworkOverviewMetric }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p
        className={cn(
          'text-center text-[31px] font-medium leading-[37.2px]',
          toneClasses[metric.tone],
        )}
      >
        {metric.value}
      </p>
      <p className="text-[13px] font-normal leading-[15.6px] text-vess-grey-400">
        {metric.label}
      </p>
    </div>
  )
}
