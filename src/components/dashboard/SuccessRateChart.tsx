import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts/types/component/Tooltip'
import { LegendDots } from '@/components/dashboard/LegendDots'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { successRateSeries } from '@/data/mock'
import { vessColors } from '@/design/colors'

const xTicks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']

export function SuccessRateChart() {
  const [period, setPeriod] = useState('Today')

  return (
    <section className="flex w-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">
          Success Rate
        </h2>
        <PeriodSelector
          value={period}
          onClick={() => setPeriod((prev) => (prev === 'Today' ? 'This week' : 'Today'))}
        />
      </header>

      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={successRateSeries}
            margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={vessColors.grey[200]}
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="time"
              ticks={xTicks}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: vessColors.grey[500],
                fontSize: 13,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 300,
              }}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              ticks={[0, 2, 4, 6, 8]}
              domain={[0, 8]}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: vessColors.grey[950],
                fontSize: 13,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 300,
              }}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: vessColors.grey[200], strokeDasharray: '3 4' }}
              content={(props) => <SuccessRateTooltip {...props} />}
            />
            <Line
              type="monotone"
              dataKey="sms"
              stroke={vessColors.primary[500]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: vessColors.primary[500], stroke: vessColors.grey[50], strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="call"
              stroke={vessColors.green[500]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: vessColors.green[500], stroke: vessColors.grey[50], strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <LegendDots
        items={[
          { label: 'SMS', tone: 'navy' },
          { label: 'Call', tone: 'green' },
        ]}
      />
    </section>
  )
}

function SuccessRateTooltip({
  active,
  payload,
  label,
}: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null
  const sms = payload.find((entry) => entry.dataKey === 'sms')?.value ?? '—'
  const call = payload.find((entry) => entry.dataKey === 'call')?.value ?? '—'
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-vess-grey-950 p-3 text-vess-grey-50">
      <p className="text-[13px] font-normal leading-[15.6px]">{label}</p>
      <p className="text-[10px] font-light leading-3 tracking-[0.4px]">
        Voice quality (Mos) : {Number(call).toFixed(1)}
      </p>
      <p className="text-[10px] font-light leading-3 tracking-[0.4px]">
        Voice quality (Mos) : {Number(sms).toFixed(1)}
      </p>
    </div>
  )
}
