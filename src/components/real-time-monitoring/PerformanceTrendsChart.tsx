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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { performanceTrendsPeriodOptions, performanceTrendsSeries } from '@/data/real-time-monitoring'
import { vessColors } from '@/design/colors'

const xTicks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']

export function PerformanceTrendsChart() {
  const [period, setPeriod] = useState<string>(performanceTrendsPeriodOptions[0])

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-medium leading-6 text-vess-grey-950">Performance Trends</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-11 w-fit max-w-[200px] shrink-0 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {performanceTrendsPeriodOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceTrendsSeries} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={vessColors.grey[200]} strokeDasharray="3 4" />
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
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: vessColors.grey[950],
                fontSize: 13,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 300,
              }}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: vessColors.grey[200], strokeDasharray: '3 4' }}
              content={(props) => <TrendsTooltip {...props} />}
            />
            <Line
              type="monotone"
              dataKey="callSuccess"
              name="Call Success"
              stroke={vessColors.primary[500]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: vessColors.primary[500], stroke: vessColors.grey[50], strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="smsDelivery"
              name="SMS Delivery"
              stroke={vessColors.green[500]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: vessColors.green[500], stroke: vessColors.grey[50], strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="dataThroughput"
              name="Data Throughput"
              stroke={vessColors.secondary[500]}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: vessColors.secondary[500],
                stroke: vessColors.grey[50],
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <LegendDots
        className="flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-center"
        items={[
          { label: 'Call Success', tone: 'navy' },
          { label: 'SMS Delivery', tone: 'green' },
          { label: 'Data Throughput', tone: 'amber' },
        ]}
      />
    </section>
  )
}

function TrendsTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null

  const call = payload.find((p) => p.dataKey === 'callSuccess')?.value
  const sms = payload.find((p) => p.dataKey === 'smsDelivery')?.value
  const data = payload.find((p) => p.dataKey === 'dataThroughput')?.value

  return (
    <div className="flex min-w-[180px] flex-col gap-2 rounded-lg bg-vess-grey-950 p-3 text-vess-grey-50">
      <p className="text-[11px] font-normal leading-[15.6px]">{label}</p>
      <p className="text-[11px] font-light leading-[15.6px]">Call Success: {Number(call).toFixed(1)}%</p>
      <p className="text-[11px] font-light leading-[15.6px]">SMS Delivery: {Number(sms).toFixed(1)}%</p>
      <p className="text-[11px] font-light leading-[15.6px]">Data Throughput: {Number(data).toFixed(1)}%</p>
    </div>
  )
}
