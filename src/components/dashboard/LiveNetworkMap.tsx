import { LegendDots } from '@/components/dashboard/LegendDots'
import { buildDeviceMapEmbedUrl, vessDemoMapCenter } from '@/data/device-management'

const liveNetworkMapEmbedUrl = buildDeviceMapEmbedUrl(
  vessDemoMapCenter.latitude,
  vessDemoMapCenter.longitude,
)

export function LiveNetworkMap() {
  return (
    <section className="flex w-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col justify-center gap-1.5 text-vess-grey-950">
          <h2 className="text-[18px] font-medium leading-6">Live Network</h2>
          <p className="text-[13px] font-light leading-[18px]">
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

      <div className="h-[341px] w-full overflow-hidden rounded-2xl bg-vess-grey-100">
        <iframe
          title="Live network map"
          src={liveNetworkMapEmbedUrl}
          className="size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}
