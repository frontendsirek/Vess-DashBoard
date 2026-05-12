import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceCardGrid } from '@/components/device-management/DeviceCardGrid'
import { DeviceFilterBar } from '@/components/device-management/DeviceFilterBar'
import { DeviceKpiStrip } from '@/components/device-management/DeviceKpiStrip'
import { DeviceManagementHeader } from '@/components/device-management/DeviceManagementHeader'
import { DeviceTable } from '@/components/device-management/DeviceTable'
import { Topbar } from '@/components/layout/Topbar'
import { Pagination } from '@/components/test-management/Pagination'
import { deviceRecords, type DeviceRecord } from '@/data/device-management'
import { useUiStore } from '@/stores/ui-store'

export default function DeviceManagementPage() {
  const navigate = useNavigate()
  const view = useUiStore((state) => state.deviceManagementView)
  const setView = useUiStore((state) => state.setDeviceManagementView)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(4)

  const filteredDevices = useMemo<DeviceRecord[]>(() => {
    return deviceRecords.filter((device) => {
      if (search) {
        const q = search.toLowerCase()
        const hay =
          `${device.name} ${device.badgePrimary} ${device.badgeSecondary ?? ''} ${device.location}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (statusFilter !== 'All Status' && device.status !== statusFilter) return false
      return true
    })
  }, [search, statusFilter])

  function handleViewDevice(device: DeviceRecord) {
    navigate(`/device-management/${device.id}`)
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Fleet health, registration & remote access" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <DeviceManagementHeader onRegisterDevice={() => navigate('/device-management/register')} />

        <DeviceKpiStrip />

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

            {view === 'list' ? (
              <DeviceTable devices={filteredDevices} onView={handleViewDevice} />
            ) : (
              <DeviceCardGrid devices={filteredDevices} onView={handleViewDevice} />
            )}
          </div>

          <Pagination currentPage={currentPage} totalPages={30} onChange={setCurrentPage} />
        </section>
      </div>
    </>
  )
}
