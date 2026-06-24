import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { RemoteControlSessionGate } from '@/components/remote-device-control/RemoteControlSessionGate'
import { useDeviceDetailQuery } from '@/hooks/devices/use-device-detail-query'
import { useDevicesListQuery } from '@/hooks/devices/use-devices-list-query'
import { useDevicesSearchQuery } from '@/hooks/devices/use-devices-search-query'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value'
import { mapApiDeviceToRemoteControlDevice } from '@/lib/map-api-device-to-remote-control-device'
import { cn } from '@/lib/utils'
import type { RemoteControlConnectionState, RemoteControlDevice } from '@/types/remote-device-control'
import { useAuthStore } from '@/stores/auth-store'

const LIST_PAGE_SIZE = 100

const stateChip: Record<RemoteControlConnectionState, string> = {
  online: 'bg-vess-green-50 text-vess-green-800',
  warning: 'bg-vess-secondary-50 text-vess-secondary-500',
  offline: 'bg-vess-red-50 text-vess-red-500',
}

const stateLabel: Record<RemoteControlConnectionState, string> = {
  online: 'Online',
  warning: 'Warning',
  offline: 'Offline',
}

export default function RemoteDeviceControlPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState<'all' | RemoteControlConnectionState>('all')

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)

  const paramDeviceId = useMemo(() => {
    const fromQuery = searchParams.get('deviceId')?.trim()
    const fromState = (location.state as { deviceId?: string } | null)?.deviceId?.trim()
    const id = fromQuery ?? fromState
    return id && id.length > 0 ? id : undefined
  }, [location.state, searchParams])

  const listQuery = useDevicesListQuery(
    accessToken,
    { page: 1, page_size: LIST_PAGE_SIZE },
    debouncedSearch.length === 0,
  )

  const searchQuery = useDevicesSearchQuery(
    accessToken,
    debouncedSearch,
    debouncedSearch.length > 0,
  )

  const selectedDeviceQuery = useDeviceDetailQuery(
    accessToken,
    paramDeviceId ?? '',
    Boolean(accessToken && paramDeviceId),
  )

  const devices = useMemo(() => {
    if (!accessToken) return []
    const rows = debouncedSearch.length > 0 ? (searchQuery.data ?? []) : (listQuery.data?.results ?? [])
    return rows.map(mapApiDeviceToRemoteControlDevice)
  }, [accessToken, debouncedSearch.length, listQuery.data, searchQuery.data])

  const selectedDevice = useMemo((): RemoteControlDevice | undefined => {
    if (selectedDeviceQuery.data) {
      return mapApiDeviceToRemoteControlDevice(selectedDeviceQuery.data)
    }
    if (!paramDeviceId) return undefined
    return devices.find((device) => device.id === paramDeviceId)
  }, [devices, paramDeviceId, selectedDeviceQuery.data])

  const filteredDevices = useMemo(() => {
    let list = devices
    if (stateFilter !== 'all') {
      list = list.filter((device) => device.state === stateFilter)
    }
    return list
  }, [devices, stateFilter])

  const onlineCount = devices.filter((device) => device.state === 'online').length
  const warningCount = devices.filter((device) => device.state === 'warning').length
  const offlineCount = devices.filter((device) => device.state === 'offline').length

  const listPending = debouncedSearch.length === 0 && accessToken ? listQuery.isPending : false
  const searchPending = debouncedSearch.length > 0 && accessToken ? searchQuery.isPending : false
  const listError = debouncedSearch.length === 0 && accessToken ? listQuery.isError : false
  const searchError = debouncedSearch.length > 0 && accessToken ? searchQuery.isError : false
  const selectedPending = Boolean(paramDeviceId && accessToken && selectedDeviceQuery.isPending && !selectedDevice)

  const inSession = Boolean(selectedDevice && selectedDevice.state !== 'offline')

  function exitSession() {
    navigate('/remote-device-control', { replace: true })
  }

  return (
    <>
      <div className="px-5 py-6">
        {!accessToken ? (
          <section className="rounded-2xl bg-vess-grey-50 p-6">
            <p className="text-[13px] text-vess-grey-800">Sign in to load devices from the API.</p>
          </section>
        ) : selectedPending ? (
          <section className="rounded-2xl bg-vess-grey-50 p-6">
            <p className="text-center text-[13px] text-vess-grey-600">Loading device…</p>
          </section>
        ) : inSession && selectedDevice ? (
          <RemoteControlSessionGate
            accessToken={accessToken}
            device={selectedDevice}
            onExitSession={exitSession}
          />
        ) : (
          <section className="rounded-2xl bg-vess-grey-50 p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[18px] font-semibold leading-[26px] text-vess-grey-950">
                Select Device for Remote Control
              </h2>
              <p className="text-[11px] font-light text-vess-grey-800">
                Choose an online device to start remote control session
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-3 py-2">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search devices..."
                  className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-vess-grey-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {(
                  [
                    { key: 'all', label: 'All', count: devices.length },
                    { key: 'online', label: 'Online', count: onlineCount },
                    { key: 'warning', label: 'Warning', count: warningCount },
                    { key: 'offline', label: 'Offline', count: offlineCount },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setStateFilter(filter.key)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
                      stateFilter === filter.key
                        ? 'bg-vess-primary-500 text-vess-grey-50'
                        : 'border border-vess-grey-200 bg-vess-grey-50 text-vess-grey-800 hover:bg-vess-grey-100',
                    )}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            {(listError || searchError) && (
              <p className="mt-4 rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[13px] text-vess-red-800">
                Could not load devices. Check your connection and try again.
              </p>
            )}

            {(listPending || searchPending) && (
              <div className="mt-6 rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-8 text-center text-[13px] text-vess-grey-600">
                Loading devices…
              </div>
            )}

            {!listPending && !searchPending && (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    highlight={paramDeviceId === device.id}
                    onConnect={() => {
                      navigate(`/remote-device-control?deviceId=${encodeURIComponent(device.id)}`)
                    }}
                  />
                ))}

                {filteredDevices.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-[12px] font-medium text-vess-grey-950">No devices found</p>
                    <p className="mt-1 text-[11px] text-vess-grey-500">
                      Try adjusting your search or filter.
                    </p>
                  </div>
                )}
              </div>
            )}
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
  device: RemoteControlDevice
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
          'inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-medium',
          stateChip[device.state],
        )}
      >
        {stateLabel[device.state]}
      </span>

      <div>
        <p className="text-[14px] font-semibold text-vess-grey-950">{device.name}</p>
        <p className="mt-1 inline-block rounded-md bg-vess-grey-100 px-2 py-0.5 text-[11px] text-vess-grey-800">
          {device.location}
        </p>
      </div>

      <dl className="flex flex-col gap-2 text-[11px]">
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
          'rounded-xl py-2.5 text-[12px] font-medium transition-colors',
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
