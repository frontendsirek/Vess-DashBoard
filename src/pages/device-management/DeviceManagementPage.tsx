import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceCardGrid } from '@/components/device-management/DeviceCardGrid'
import { DeviceFilterBar } from '@/components/device-management/DeviceFilterBar'
import { DeviceKpiStrip } from '@/components/device-management/DeviceKpiStrip'
import { DeviceManagementHeader } from '@/components/device-management/DeviceManagementHeader'
import { DeviceTable } from '@/components/device-management/DeviceTable'
import { Topbar } from '@/components/layout/Topbar'
import { Pagination } from '@/components/test-management/Pagination'
import {
  deviceRecords,
  type DeviceRecord,
} from '@/data/device-management'
import { useDevicesKpiQuery } from '@/hooks/devices/use-devices-kpi-query'
import { useDevicesListQuery } from '@/hooks/devices/use-devices-list-query'
import { useDevicesSearchQuery } from '@/hooks/devices/use-devices-search-query'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value'
import { mapApiDeviceToDeviceRecord } from '@/lib/api-device-mapper'
import type { ListDevicesParams } from '@/services/device.service'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

const PAGE_SIZE = 10

export default function DeviceManagementPage() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const view = useUiStore((state) => state.deviceManagementView)
  const setView = useUiStore((state) => state.setDeviceManagementView)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, debouncedSearch])

  const listParams = useMemo((): ListDevicesParams => {
    const params: ListDevicesParams = {
      page: currentPage,
      page_size: PAGE_SIZE,
    }
    if (statusFilter === 'Online') params.status = 'ONLINE'
    else if (statusFilter === 'Offline') params.status = 'OFFLINE'
    return params
  }, [currentPage, statusFilter])

  const kpiQuery = useDevicesKpiQuery(accessToken)

  const listQuery = useDevicesListQuery(accessToken, listParams, debouncedSearch.length === 0)

  const searchQuery = useDevicesSearchQuery(accessToken, debouncedSearch, debouncedSearch.length > 0)

  const mappedFromList = useMemo(() => {
    const rows = listQuery.data?.results ?? []
    return rows.map(mapApiDeviceToDeviceRecord)
  }, [listQuery.data])

  const mappedFromSearch = useMemo(() => {
    const rows = searchQuery.data ?? []
    return rows.map(mapApiDeviceToDeviceRecord)
  }, [searchQuery.data])

  const mockFilteredDevices = useMemo<DeviceRecord[]>(() => {
    return deviceRecords.filter((device) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay =
          `${device.name} ${device.badgePrimary} ${device.badgeSecondary ?? ''} ${device.location}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (statusFilter !== 'All Status' && device.status !== statusFilter) return false
      return true
    })
  }, [search, statusFilter])

  const filteredDevices = useMemo<DeviceRecord[]>(() => {
    if (!accessToken) return mockFilteredDevices
    const base = debouncedSearch.length > 0 ? mappedFromSearch : mappedFromList
    if (statusFilter === 'All Status') return base
    if (statusFilter === 'Online' || statusFilter === 'Offline') return base
    return base.filter((d) => d.status === statusFilter)
  }, [
    accessToken,
    debouncedSearch.length,
    mappedFromList,
    mappedFromSearch,
    mockFilteredDevices,
    statusFilter,
  ])

  const totalPages =
    debouncedSearch.length > 0 ?
      1
      : Math.max(1, Math.ceil((listQuery.data?.count ?? 0) / PAGE_SIZE))

  const listPending =
    debouncedSearch.length === 0 && accessToken ? listQuery.isPending : false
  const searchPending =
    debouncedSearch.length > 0 && accessToken ? searchQuery.isPending : false
  const listError =
    debouncedSearch.length === 0 && accessToken ? listQuery.isError : false
  const searchError =
    debouncedSearch.length > 0 && accessToken ? searchQuery.isError : false

  function handleViewDevice(device: DeviceRecord) {
    navigate(`/device-management/${device.id}`)
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Fleet health, registration & remote access" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <DeviceManagementHeader onRegisterDevice={() => navigate('/device-management/register')} />

        {!accessToken ? (
          <DeviceKpiStrip />
        ) : (
          <DeviceKpiStrip
            summary={{
              total: kpiQuery.data?.total ?? 0,
              online: kpiQuery.data?.online ?? 0,
              offline: kpiQuery.data?.offline ?? 0,
              lowBattery: null,
            }}
            summaryPending={kpiQuery.isPending}
          />
        )}

        <section className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">
              Device Management List
            </h2>
          </header>

          <div className="flex flex-col gap-4">
            <DeviceFilterBar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              view={view}
              onViewChange={setView}
            />

            {!accessToken && (
              <p className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-[15px] text-vess-grey-800">
                Sign in to load devices from the API. The list below shows demo data until then.
              </p>
            )}

            {(listError || searchError) && (
              <p className="rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[15px] text-vess-red-800">
                Could not load devices. Check your connection and try again.
              </p>
            )}

            {(listPending || searchPending) && accessToken ? (
              <div className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-8 text-center text-[15px] text-vess-grey-600">
                Loading devices…
              </div>
            ) : (
              <>
                {view === 'list' ? (
                  <DeviceTable devices={filteredDevices} onView={handleViewDevice} />
                ) : (
                  <DeviceCardGrid devices={filteredDevices} onView={handleViewDevice} />
                )}
                {accessToken && !listPending && !searchPending && filteredDevices.length === 0 ? (
                  <p className="py-2 text-center text-[14px] text-vess-grey-500">
                    No devices match your filters.
                  </p>
                ) : null}
              </>
            )}
          </div>

          {accessToken && debouncedSearch.length === 0 && totalPages > 1 ? (
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          ) : null}
        </section>
      </div>
    </>
  )
}
