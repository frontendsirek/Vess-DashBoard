import { useState } from 'react'
import { MinusIcon, PlusIcon } from '@/components/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { HeatmapMarkerStatus } from '@/data/real-time-monitoring'
import { heatmapMarkers, heatmapPeriodOptions } from '@/data/real-time-monitoring'
import { cn } from '@/lib/utils'

const markerDot: Record<HeatmapMarkerStatus, string> = {
  healthy: 'bg-vess-green-500',
  warning: 'bg-vess-secondary-500',
  offline: 'bg-vess-red-500',
}

export function NetworkHeatmapCard() {
  const [period, setPeriod] = useState<string>(heatmapPeriodOptions[0])
  const [zoom, setZoom] = useState(1)

  return (
    <section className="flex flex-col gap-6 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Network Heatmap</h2>
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
        <img
          src="/images/real-time-monitoring-heatmap.svg"
          alt=""
          className="h-full w-full object-cover"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        />
        <div className="pointer-events-none absolute inset-0">
          {heatmapMarkers.map((m) => (
            <span
              key={m.id}
              className={cn(
                'absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-vess-grey-50',
                markerDot[m.status],
              )}
              style={{ left: `${m.leftPct}%`, top: `${m.topPct}%` }}
              aria-hidden
            />
          ))}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.5))}
            className="flex size-9 items-center justify-center rounded-lg bg-vess-grey-50 text-vess-grey-950 shadow-md"
          >
            <PlusIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.75))}
            className="flex size-9 items-center justify-center rounded-lg bg-vess-grey-50 text-vess-grey-950 shadow-md"
          >
            <MinusIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-[13px] font-normal leading-[15.6px] text-vess-grey-950">
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
