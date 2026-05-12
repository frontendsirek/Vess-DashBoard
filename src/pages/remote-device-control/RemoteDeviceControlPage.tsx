import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { RemoteControlSessionView } from '@/components/remote-device-control/RemoteControlSessionView'
import { Topbar } from '@/components/layout/Topbar'
import { remoteDevices, type RemoteDevice } from '@/data/alerts-mock'
import {
  buildDeviceDetailView,
  resolveDeviceRecord,
  resolveRemoteDeviceHighlightId,
} from '@/data/device-management'
import { cn } from '@/lib/utils'

const stateChip: Record<RemoteDevice['state'], string> = {
  online: 'bg-vess-green-50 text-vess-green-800',
  warning: 'bg-vess-secondary-50 text-vess-secondary-500',
  offline: 'bg-vess-red-50 text-vess-red-500',
}

const stateLabel: Record<RemoteDevice['state'], string> = {
  online: 'Online',
  warning: 'Warning',
  offline: 'Offline',
}

export default function RemoteDeviceControlPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const paramDeviceId = useMemo(() => {
    const fromQuery = searchParams.get('deviceId')
    const fromState = (location.state as { deviceId?: string } | null)?.deviceId
    return fromQuery ?? fromState ?? undefined
  }, [location.state, searchParams])

  const remoteId = useMemo(
    () => resolveRemoteDeviceHighlightId(paramDeviceId),
    [paramDeviceId],
  )

  const remote = useMemo(
    () => (remoteId ? remoteDevices.find((d) => d.id === remoteId) : undefined),
    [remoteId],
  )

  const modelLabel = useMemo(() => {
    if (paramDeviceId?.startsWith('dev-')) {
      const rec = resolveDeviceRecord(paramDeviceId)
      if (rec) return buildDeviceDetailView(rec).subtitle
    }
    return remote?.model ?? ''
  }, [paramDeviceId, remote])

  const inSession = Boolean(remote && remote.state !== 'offline')

  function exitSession() {
    navigate('/remote-device-control', { replace: true })
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Device fleet management" />

      <div className="px-5 py-6">
        {inSession && remote ? (
          <RemoteControlSessionView
            device={remote}
            modelLabel={modelLabel}
            onExitSession={exitSession}
          />
        ) : (
          <section className="rounded-2xl bg-vess-grey-50 p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-semibold leading-[26px] text-vess-grey-950">
                Select Device for Remote Control
              </h2>
              <p className="text-[13px] font-light text-vess-grey-800">
                Choose an online device to start remote control session
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {remoteDevices.map((d) => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  highlight={remoteId === d.id}
                  onConnect={() => {
                    navigate(`/remote-device-control?deviceId=${encodeURIComponent(d.id)}`)
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

function DeviceCard({
  device,
  highlight,
  onConnect,
}: {
  device: RemoteDevice
  highlight: boolean
  onConnect: () => void
}) {
  const isOffline = device.state === 'offline'
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (highlight) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlight])

  return (
    <article
      ref={cardRef}
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-vess-grey-200 bg-vess-grey-50 p-5 transition-shadow',
        highlight && 'ring-2 ring-vess-primary-500 ring-offset-2 ring-offset-vess-grey-50',
      )}
    >
      <span
        className={cn(
          'inline-flex w-fit rounded-full px-3 py-1 text-[12px] font-medium',
          stateChip[device.state],
        )}
      >
        {stateLabel[device.state]}
      </span>

      <div>
        <p className="text-[16px] font-semibold text-vess-grey-950">{device.name}</p>
        <p className="mt-1 inline-block rounded-md bg-vess-grey-100 px-2 py-0.5 text-[12px] text-vess-grey-800">
          {device.location}
        </p>
      </div>

      <dl className="flex flex-col gap-2 text-[13px]">
        <Row label="Battery" value={`${device.battery}%`} />
        <Row label="Network" value={device.network} />
        <Row label="Signal" value={device.signal} />
        <Row label="Last Test" value={device.lastTest} />
      </dl>

      <button
        type="button"
        disabled={isOffline}
        onClick={onConnect}
        className={cn(
          'rounded-xl py-2.5 text-[14px] font-medium transition-colors',
          isOffline
            ? 'cursor-not-allowed bg-vess-grey-100 text-vess-grey-500'
            : 'bg-vess-primary-500 text-vess-grey-50 hover:bg-vess-primary-400',
        )}
      >
        {isOffline ? 'Offline' : 'Connect'}
      </button>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-vess-grey-800">{label}</dt>
      <dd className="font-medium text-vess-grey-950">{value}</dd>
    </div>
  )
}
