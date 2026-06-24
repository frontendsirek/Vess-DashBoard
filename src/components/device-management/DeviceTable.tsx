import { useMemo, useState } from 'react'
import { DeviceStatusBadge } from '@/components/device-management/DeviceStatusBadge'
import { EyeIcon } from '@/components/icons'
import {
  MANAGEMENT_TABLE_BODY_DIVIDE_STANDARD_CLASS,
  MANAGEMENT_TABLE_HEAD_ROW_CLASS,
  ManagementTableShell,
} from '@/components/shared/ManagementTableShell'
import { Checkbox } from '@/components/ui/checkbox'
import {
  type DeviceRecord,
  deviceShowsLowBatteryTag,
  formatDeviceNetworkDisplay,
} from '@/data/device-management'
import { cn } from '@/lib/utils'

type DeviceTableProps = {
  devices: DeviceRecord[]
  onView?: (device: DeviceRecord) => void
}

export function DeviceTable({ devices, onView }: DeviceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allSelected = useMemo(
    () => devices.length > 0 && devices.every((d) => selected.has(d.id)),
    [devices, selected],
  )

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(devices.map((d) => d.id)) : new Set())
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <ManagementTableShell>
      <table className="w-full min-w-[960px] table-fixed text-left">
        {/*
          First column width: auto — under table-fixed, consumes space left after fixed columns
          so the Action column does not balloon with empty space on the right.
        */}
        <colgroup>
          <col style={{ width: '1%', minWidth: 290 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 147 }} />
          <col style={{ width: 136 }} />
        </colgroup>
        <thead className={MANAGEMENT_TABLE_HEAD_ROW_CLASS}>
          <tr>
            <th className="px-5 py-4 text-left font-normal">
              <div className="flex items-center gap-5">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span>Device</span>
              </div>
            </th>
            <th className="px-5 py-4 font-normal">Location</th>
            <th className="px-5 py-4 font-normal">Battery</th>
            <th className="px-5 py-4 font-normal">Network</th>
            <th className="px-5 py-4 font-normal">Last seen</th>
            <th className="px-5 py-4 font-normal">Status</th>
            <th className="px-5 py-4 font-normal">Action</th>
          </tr>
        </thead>
        <tbody className={MANAGEMENT_TABLE_BODY_DIVIDE_STANDARD_CLASS}>
          {devices.map((device) => {
            const lowBattery = deviceShowsLowBatteryTag(device)
            return (
              <tr key={device.id} className="hover:bg-vess-grey-100/40">
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center gap-5">
                    <Checkbox
                      checked={selected.has(device.id)}
                      onCheckedChange={(c) => toggleOne(device.id, Boolean(c))}
                    />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span>{device.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-vess-grey-100 px-1.5 py-1 text-[11px] font-normal leading-[15.6px] text-vess-grey-500">
                          {device.badgePrimary}
                        </span>
                        {device.badgeSecondary && (
                          <span className="rounded-lg bg-vess-grey-100 px-1.5 py-1 text-[11px] font-normal leading-[15.6px] text-vess-grey-500">
                            {device.badgeSecondary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">{device.location}</td>
                <td className="px-5 py-4 align-middle">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'whitespace-nowrap tabular-nums',
                        lowBattery && 'font-medium text-vess-red-500',
                      )}
                    >
                      {device.batteryPercent}%
                    </span>
                    {lowBattery && (
                      <span className="rounded-md bg-vess-red-50 px-2 py-0.5 text-[11px] font-medium text-vess-red-500">
                        Low
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">{formatDeviceNetworkDisplay(device)}</td>
                <td className="px-5 py-4 align-middle">{device.lastSeen}</td>
                <td className="px-5 py-4 align-middle">
                  <DeviceStatusBadge status={device.status} />
                </td>
                <td className="px-5 py-4 align-middle">
                  <button
                    type="button"
                    onClick={() => onView?.(device)}
                    className="inline-flex items-center gap-2.5 rounded border border-vess-grey-100 bg-vess-grey-50 px-1.5 py-1.5 text-[13px] font-normal leading-[18px] text-vess-grey-950 transition-colors hover:border-vess-primary-300 hover:text-vess-primary-500"
                  >
                    <EyeIcon className="size-4 shrink-0" />
                    View
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </ManagementTableShell>
  )
}
