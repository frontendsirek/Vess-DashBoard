import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceCardGrid } from '@/components/device-management/DeviceCardGrid'
import { DeviceFilterBar } from '@/components/device-management/DeviceFilterBar'
import { DeviceKpiStrip } from '@/components/device-management/DeviceKpiStrip'
import { DeviceManagementHeader } from '@/components/device-management/DeviceManagementHeader'
import { DeviceTable } from '@/components/device-management/DeviceTable'
import { Pagination } from '@/components/test-management/Pagination'
import type { DeviceRecord } from '@/data/device-management'
import { useDevicesKpiQuery } from '@/hooks/devices/use-devices-kpi-query'
import { useDevicesListQuery } from '@/hooks/devices/use-devices-list-query'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value'
import { mapApiDeviceToDeviceRecord } from '@/lib/api-device-mapper'
import {
  DEVICE_LIST_STATUS_FILTER_ALL,
  deviceListStatusFilterToApiParam,
  type DeviceListStatusFilter,
} from '@/lib/device-list-status-filter'
import type { ListDevicesParams } from '@/types/device'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

const PAGE_SIZE = 10

export default function DeviceManagementPage() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const view = useUiStore((state) => state.deviceManagementView)
  const setView = useUiStore((state) => state.setDeviceManagementView)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeviceListStatusFilter>(
    DEVICE_LIST_STATUS_FILTER_ALL,
  )
  const [currentPage, setCurrentPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)

  function handleSearchChange(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  function handleStatusFilterChange(value: DeviceListStatusFilter) {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const listParams = useMemo((): ListDevicesParams => {
    const params: ListDevicesParams = {
      page: currentPage,
      page_size: PAGE_SIZE,
      ordering: '-created_at',
    }

    const apiStatus = deviceListStatusFilterToApiParam(statusFilter)
    if (apiStatus) {
      params.status = apiStatus
    }

    if (debouncedSearch.length > 0) {
      params.search = debouncedSearch
    }

    return params
  }, [currentPage, debouncedSearch, statusFilter])

  const kpiQuery = useDevicesKpiQuery(accessToken)

  const listQuery = useDevicesListQuery(accessToken, listParams, true)

  const devices = useMemo<DeviceRecord[]>(() => {
    if (!accessToken) return []
    const rows = listQuery.data?.results ?? []
    return rows.map(mapApiDeviceToDeviceRecord)
  }, [accessToken, listQuery.data])

  const totalPages = Math.max(1, Math.ceil((listQuery.data?.count ?? 0) / PAGE_SIZE))

  const listPending = accessToken ? listQuery.isPending : false
  const listError = accessToken ? listQuery.isError : false

  function handleViewDevice(device: DeviceRecord) {
    navigate(`/device-management/${device.id}`)
  }

  return (
    <>
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
              warning: kpiQuery.data?.warning ?? 0,
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
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              view={view}
              onViewChange={setView}
            />

            {!accessToken && (
              <p className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-[15px] text-vess-grey-800">
                Sign in to load devices from the API.
              </p>
            )}

            {listError && (
              <p className="rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[15px] text-vess-red-800">
                Could not load devices. Check your connection and try again.
              </p>
            )}

            {listPending && accessToken ? (
              <div className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-8 text-center text-[15px] text-vess-grey-600">
                Loading devices…
              </div>
            ) : (
              <>
                {view === 'list' ? (
                  <DeviceTable devices={devices} onView={handleViewDevice} />
                ) : (
                  <DeviceCardGrid devices={devices} onView={handleViewDevice} />
                )}
                {accessToken && !listPending && devices.length === 0 ?
                  <p className="py-2 text-center text-[14px] text-vess-grey-500">
                    No devices match your filters.
                  </p>
                : null}
                {!accessToken ? (
                  <p className="py-2 text-center text-[14px] text-vess-grey-500">Sign in to see your fleet.</p>
                ) : null}
              </>
            )}
          </div>

          {accessToken && totalPages > 1 ? (
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          ) : null}
        </section>
      </div>
    </>
  )
}
