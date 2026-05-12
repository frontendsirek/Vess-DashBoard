import { DeviceCard } from '@/components/device-management/DeviceCard'
import type { DeviceRecord } from '@/data/device-management'

type DeviceCardGridProps = {
  devices: DeviceRecord[]
  onView?: (device: DeviceRecord) => void
}

export function DeviceCardGrid({ devices, onView }: DeviceCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} onView={onView} />
      ))}
    </div>
  )
}
