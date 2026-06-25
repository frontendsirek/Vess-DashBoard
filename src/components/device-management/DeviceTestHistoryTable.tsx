import {
  CallIcon,
  SmsIcon,
  UssdHashIcon,
} from '@/components/icons'
import {
  MANAGEMENT_TABLE_BODY_DIVIDE_HEAVY_CLASS,
  MANAGEMENT_TABLE_HEAD_ROW_CLASS,
  ManagementTableSelectColumnPlaceholder,
  ManagementTableShell,
} from '@/components/shared/ManagementTableShell'
import {
  deviceTestHistoryKindLabel,
  type DeviceTestHistoryKind,
  type DeviceTestHistoryOutcome,
  type DeviceTestHistoryRow,
} from '@/data/device-management'
import { cn } from '@/lib/utils'

type DeviceTestHistoryTableProps = {
  rows: DeviceTestHistoryRow[]
}

function TypeKindIcon({ kind, className }: { kind: DeviceTestHistoryKind; className?: string }) {
  if (kind === 'Call') return <CallIcon className={cn('size-4 shrink-0 text-vess-grey-950', className)} />
  if (kind === 'SMS') return <SmsIcon className={cn('size-4 shrink-0 text-vess-grey-950', className)} />
  return <UssdHashIcon className={cn('size-4 shrink-0 text-vess-grey-950', className)} />
}

function OutcomeBadge({ outcome }: { outcome: DeviceTestHistoryOutcome }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[102px] justify-center rounded-full px-3 py-1 text-[13px] font-normal leading-[18px]',
        outcome === 'Success' && 'bg-vess-green-50 text-vess-green-500',
        outcome === 'Failed' && 'bg-vess-red-50 text-vess-red-500',
        outcome === 'Running' && 'bg-vess-primary-50 text-vess-primary-500',
      )}
    >
      {outcome === 'Success' ? 'Success' : outcome === 'Failed' ? 'Failed' : 'Running'}
    </span>
  )
}

export function DeviceTestHistoryTable({ rows }: DeviceTestHistoryTableProps) {
  return (
    <ManagementTableShell>
      <table className="w-full min-w-[900px] text-left">
        <thead className={MANAGEMENT_TABLE_HEAD_ROW_CLASS}>
          <tr>
            <th className="w-12 px-5 py-4">
              <span className="sr-only">Select row</span>
              <ManagementTableSelectColumnPlaceholder />
            </th>
            <th className="px-5 py-4 font-normal">Type</th>
            <th className="px-5 py-4 font-normal">Target / Details</th>
            <th className="whitespace-nowrap px-5 py-4 font-normal">Duration</th>
            <th className="px-5 py-4 font-normal">Timestamp</th>
            <th className="px-5 py-4 font-normal">Additional info</th>
            <th className="px-5 py-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody className={MANAGEMENT_TABLE_BODY_DIVIDE_HEAVY_CLASS}>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-5 py-4 align-middle">
                <ManagementTableSelectColumnPlaceholder />
              </td>
              <td className="px-5 py-4 align-middle">
                <div className="flex items-center gap-1.5">
                  <TypeKindIcon kind={row.kind} />
                  <span className="font-normal leading-[18px]">
                    {deviceTestHistoryKindLabel(row.kind)}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 align-middle">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-normal leading-[18px] text-vess-grey-950">
                    {row.targetMsisdn}
                  </span>
                  <span className="text-[11px] font-normal leading-[15.6px] text-vess-grey-500">
                    {row.detailLine}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 align-middle font-normal leading-[18px]">
                {row.durationSeconds}s
              </td>
              <td className="px-5 py-4 align-middle">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-normal leading-[18px] text-vess-grey-950">
                    {row.dateDisplay}
                  </span>
                  <span className="text-[11px] font-normal leading-[15.6px] text-vess-grey-500">
                    {row.timeDisplay}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 align-middle text-[13px] font-normal leading-[18px]">
                {row.additionalInfo}
              </td>
              <td className="px-5 py-4 align-middle">
                <OutcomeBadge outcome={row.outcome} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ManagementTableShell>
  )
}
