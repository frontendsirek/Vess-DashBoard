import { LegendDots } from '@/components/dashboard/LegendDots'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type Marker = {
  id: string
  x: number
  y: number
  state: 'active' | 'inactive'
  label: string
}

const markers: Marker[] = [
  { id: 'm-1', x: 38, y: 62, state: 'active', label: 'Lagos' },
  { id: 'm-2', x: 50, y: 50, state: 'active', label: 'Abuja' },
  { id: 'm-3', x: 62, y: 30, state: 'inactive', label: 'Kano' },
  { id: 'm-4', x: 33, y: 42, state: 'active', label: 'Ibadan' },
]

export function LiveNetworkMap() {
  return (
    <section className="flex w-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col justify-center gap-1.5 text-vess-grey-950">
          <h2 className="text-[20px] font-medium leading-6">Live Network</h2>
          <p className="text-[15px] font-light leading-[18px]">
            Monitoring MNO assets in real-time
          </p>
        </div>
        <LegendDots
          items={[
            { label: 'Active (3)', tone: 'green' },
            { label: 'Inactive (1)', tone: 'red' },
          ]}
        />
      </header>

      <div className="relative h-[341px] w-full overflow-hidden rounded-2xl bg-[#f1eee5]">
        <MapBackdrop />
        {markers.map((marker) => (
          <button
            key={marker.id}
            type="button"
            aria-label={marker.label}
            className={cn(
              '-translate-x-1/2 -translate-y-1/2 absolute size-[10px] rounded-full border-4 transition-transform hover:scale-125',
              marker.state === 'active'
                ? 'border-vess-green-50 bg-vess-green-500'
                : 'border-vess-red-50 bg-vess-red-500',
            )}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          />
        ))}
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <ZoomButton ariaLabel="Zoom in">
            <PlusIcon className="size-4" />
          </ZoomButton>
          <ZoomButton ariaLabel="Zoom out">
            <MinusIcon className="size-4" />
          </ZoomButton>
        </div>
      </div>
    </section>
  )
}

function ZoomButton({
  children,
  ariaLabel,
}: {
  children: React.ReactNode
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex size-[26px] items-center justify-center rounded-md bg-vess-grey-50 text-vess-grey-950 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-colors hover:bg-vess-grey-100"
    >
      {children}
    </button>
  )
}

function MapBackdrop() {
  return (
    <svg
      viewBox="0 0 800 340"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      <defs>
        <pattern id="map-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" stroke="#e6e2d6" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>
      <rect width="800" height="340" fill="url(#map-grid)" />
      <path
        d="M0 220 Q120 180 220 200 T440 190 T660 220 T800 210"
        fill="none"
        stroke="#d8d2c1"
        strokeWidth="2"
      />
      <path
        d="M40 100 Q160 60 280 90 T520 120 T740 90"
        fill="none"
        stroke="#d8d2c1"
        strokeWidth="2"
      />
      <path
        d="M120 260 L260 240 L380 270 L520 250 L640 280 L760 260"
        fill="none"
        stroke="#cdc7b4"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      <circle cx="320" cy="170" r="60" fill="#ece8db" />
      <circle cx="500" cy="140" r="80" fill="#ece8db" opacity="0.7" />
      <circle cx="180" cy="220" r="50" fill="#ece8db" opacity="0.6" />
    </svg>
  )
}
