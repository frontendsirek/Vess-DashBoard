import { CloseIcon } from '@/components/icons'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ApiDeviceDiagnosticsResult } from '@/types/device'
import { cn } from '@/lib/utils'

type DeviceDiagnosticsModalProps = {
  open: boolean
  onClose: () => void
  deviceName: string
  result: ApiDeviceDiagnosticsResult | null
  isPending: boolean
}

function formatDiagnosticsStatus(status: string): string {
  return status.trim().length > 0 ?
      status.charAt(0).toUpperCase() + status.slice(1)
    : 'Unknown'
}

function statusTone(status: string): string {
  const normalized = status.trim().toLowerCase()
  if (normalized === 'healthy' || normalized === 'ok' || normalized === 'online') {
    return 'bg-vess-green-50 text-vess-green-500'
  }
  if (normalized === 'warning' || normalized === 'degraded') {
    return 'bg-vess-secondary-50 text-vess-secondary-500'
  }
  return 'bg-vess-red-50 text-vess-red-500'
}

export function DeviceDiagnosticsModal({
  open,
  onClose,
  deviceName,
  result,
  isPending,
}: DeviceDiagnosticsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-[560px] gap-0 border-0 bg-vess-grey-50 p-0 shadow-xl">
        <div className="flex flex-col gap-8 px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <DialogTitle className="text-[23px] font-semibold leading-[30px] text-vess-grey-950">
                Device diagnostics
              </DialogTitle>
              <DialogDescription className="text-[13px] font-light leading-[18px] text-vess-grey-950">
                Health check results for{' '}
                <span className="font-medium">{deviceName || 'this device'}</span>.
              </DialogDescription>
            </div>
            <DialogClose
              type="button"
              aria-label="Close diagnostics"
              className="rounded-lg p-1 text-vess-grey-950 transition-opacity hover:opacity-80"
            >
              <CloseIcon className="size-6" />
            </DialogClose>
          </div>

          {isPending ?
            <p className="text-[13px] text-vess-grey-600">Running diagnostics…</p>
          : result ?
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[16px] font-light leading-[21.6px] text-vess-grey-950">
                  Overall status
                </span>
                <span
                  className={cn(
                    'inline-flex rounded-full px-3 py-1 text-[13px] font-normal leading-[18px]',
                    statusTone(result.status),
                  )}
                >
                  {formatDiagnosticsStatus(result.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DiagnosticsMetric
                  label="Battery"
                  value={
                    result.battery_level !== null ? `${result.battery_level}%` : '—'
                  }
                />
                <DiagnosticsMetric
                  label="Signal strength"
                  value={
                    result.signal_strength !== null ? `${result.signal_strength} dBm` : '—'
                  }
                />
                <DiagnosticsMetric
                  label="Heartbeat age"
                  value={
                    result.heartbeat_age_seconds !== null ?
                      `${result.heartbeat_age_seconds}s`
                    : '—'
                  }
                />
                <DiagnosticsMetric
                  label="Errors (24h)"
                  value={
                    result.error_logs_last_24h !== null ?
                      String(result.error_logs_last_24h)
                    : '—'
                  }
                />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-light leading-[21.6px] text-vess-grey-950">
                  Issues
                </span>
                {result.issues.length === 0 ?
                  <p className="text-[13px] text-vess-green-500">No issues detected.</p>
                : <ul className="flex flex-col gap-2">
                    {result.issues.map((issue) => (
                      <li
                        key={issue}
                        className="rounded-lg bg-vess-grey-100 px-3 py-2 text-[13px] text-vess-grey-950"
                      >
                        {issue.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                }
              </div>

              <p className="text-[11px] font-light text-vess-grey-500">
                Checked at {new Date(result.checked_at).toLocaleString()}
              </p>
            </div>
          : <p className="text-[13px] text-vess-grey-600">No diagnostics results yet.</p>}

          <button
            type="button"
            onClick={onClose}
            className="flex h-[50px] w-full items-center justify-center rounded-lg border border-vess-primary-500 bg-vess-grey-50 text-[13px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DiagnosticsMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-vess-grey-100 px-4 py-3">
      <span className="text-[13px] font-light leading-[18px] text-vess-grey-950">{label}</span>
      <span className="text-[16px] font-medium leading-[21.6px] text-vess-grey-950">{value}</span>
    </div>
  )
}
