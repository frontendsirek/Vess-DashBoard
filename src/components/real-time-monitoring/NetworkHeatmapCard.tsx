import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildDeviceMapEmbedUrl, vessDemoMapCenter } from '@/data/device-management'
import { heatmapPeriodOptions } from '@/data/real-time-monitoring'
import { cn } from '@/lib/utils'

const networkHeatmapMapEmbedUrl = buildDeviceMapEmbedUrl(
  vessDemoMapCenter.latitude,
  vessDemoMapCenter.longitude,
)

export function NetworkHeatmapCard() {
  const [period, setPeriod] = useState<string>(heatmapPeriodOptions[0])

  return (
    <section className="flex flex-col gap-6 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-medium leading-6 text-vess-grey-950">Network Heatmap</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-11 w-fit max-w-[200px] shrink-0 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {heatmapPeriodOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="relative min-h-[260px] w-full overflow-hidden rounded-2xl border border-vess-grey-200 bg-vess-grey-100 sm:min-h-[320px]">
        <iframe
          title="Network heatmap map"
          src={networkHeatmapMapEmbedUrl}
          className="size-full min-h-[260px] border-0 sm:min-h-[320px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex flex-wrap items-center gap-5 text-[11px] font-normal leading-[15.6px] text-vess-grey-950">
        <LegendDot label="Healthy" className="bg-vess-green-500" />
        <LegendDot label="Warning" className="bg-vess-secondary-500" />
        <LegendDot label="Offline" className="bg-vess-red-500" />
      </div>
    </section>
  )
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('size-2 rounded-full', className)} aria-hidden />
      {label}
    </div>
  )
}
