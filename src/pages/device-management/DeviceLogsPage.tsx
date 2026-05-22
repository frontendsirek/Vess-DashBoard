import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DeviceLogsList } from '@/components/device-management/DeviceLogsList'
import { ArrowBackIcon, ExportDownloadIcon, RefreshBoldIcon, SearchIcon } from '@/components/icons'
import { Topbar } from '@/components/layout/Topbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { deviceLogsFor, resolveDeviceRecord, type DeviceLogEntry } from '@/data/device-management'
import { useDeviceDetailQuery } from '@/hooks/devices/use-device-detail-query'
import { useAuthStore } from '@/stores/auth-store'

const LEVEL_OPTIONS = ['All Levels', 'INFO', 'DEBUG', 'WARNING', 'ERROR'] as const

const CATEGORY_OPTIONS = [
  'All Categories',
  'System',
  'Test',
  'Network',
  'Storage',
  'Location',
] as const

function downloadLogsCsv(deviceName: string, entries: DeviceLogEntry[]) {
  const header = ['timestamp', 'level', 'category', 'message']
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = [
    header.join(','),
    ...entries.map((e) =>
      [e.timestamp, e.level, e.category, e.message].map(escape).join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = `device-logs-${deviceName.replace(/\s+/g, '-')}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(objectUrl)
}

export default function DeviceLogsPage() {
  const { deviceId = '' } = useParams()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const mockDevice = useMemo(() => resolveDeviceRecord(deviceId), [deviceId])
  const queryApi = !mockDevice && Boolean(deviceId && accessToken)
  const apiDeviceQuery = useDeviceDetailQuery(accessToken, deviceId, queryApi)

  const allLogs = useMemo(() => {
    if (mockDevice) return deviceLogsFor(deviceId)
    return []
  }, [mockDevice, deviceId])

  const deviceDisplayName = mockDevice?.name ?? apiDeviceQuery.data?.device_name ?? ''

  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>(LEVEL_OPTIONS[0])
  const [categoryFilter, setCategoryFilter] = useState<string>(CATEGORY_OPTIONS[0])

  useEffect(() => {
    if (!deviceId.trim()) {
      navigate('/device-management', { replace: true })
    }
  }, [deviceId, navigate])

  const filteredLogs = useMemo(() => {
    return allLogs.filter((entry) => {
      if (levelFilter !== LEVEL_OPTIONS[0] && entry.level !== levelFilter) return false
      if (categoryFilter !== CATEGORY_OPTIONS[0] && entry.category !== categoryFilter)
        return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const hay =
          `${entry.message} ${entry.category} ${entry.level} ${entry.timestamp}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [allLogs, search, levelFilter, categoryFilter])

  function handleRefresh() {
    setSearch('')
    setLevelFilter(LEVEL_OPTIONS[0])
    setCategoryFilter(CATEGORY_OPTIONS[0])
    if (!mockDevice && accessToken && deviceId) {
      void apiDeviceQuery.refetch()
    }
  }

  if (!deviceId.trim()) {
    return null
  }

  if (!mockDevice) {
    if (!accessToken) {
      return (
        <>
          <Topbar title="Device Management" subtitle="Device fleet management" />
          <div className="flex flex-col gap-4 px-5 py-6">
            <p className="text-center text-[15px] text-vess-grey-800">
              Sign in to load this device&apos;s logs.
            </p>
            <button
              type="button"
              onClick={() => navigate('/device-management')}
              className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium text-vess-primary-500"
            >
              Back to devices
            </button>
          </div>
        </>
      )
    }

    if (apiDeviceQuery.isPending) {
      return (
        <>
          <Topbar title="Device Management" subtitle="Device fleet management" />
          <div className="px-5 py-6">
            <p className="text-center text-[15px] text-vess-grey-600">Loading device…</p>
          </div>
        </>
      )
    }

    if (apiDeviceQuery.isError) {
      const errMsg =
        apiDeviceQuery.error instanceof Error ? apiDeviceQuery.error.message : 'Request failed.'
      return (
        <>
          <Topbar title="Device Management" subtitle="Device fleet management" />
          <div className="flex flex-col gap-4 px-5 py-6">
            <p className="text-center text-[15px] text-vess-red-800">
              Could not load device. {errMsg}
            </p>
            <button
              type="button"
              onClick={() => navigate('/device-management')}
              className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium text-vess-primary-500"
            >
              Back to devices
            </button>
          </div>
        </>
      )
    }
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Device fleet management" />
      <div className="px-5 py-6">
        <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-100 px-4 py-6 md:px-5">
          <button
            type="button"
            onClick={() => navigate(`/device-management/${encodeURIComponent(deviceId)}`)}
            className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
          >
            <ArrowBackIcon className="size-6" />
            <span className="text-[18px] font-light leading-[21.6px]">Back</span>
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3">
              <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">Device Logs</h1>
              <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">{deviceDisplayName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
              >
                <RefreshBoldIcon className="size-6 shrink-0" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => downloadLogsCsv(deviceDisplayName || 'device', filteredLogs)}
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
              >
                <ExportDownloadIcon className="size-6 shrink-0" />
                Export
              </button>
            </div>
          </div>

          <section className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5 md:px-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex h-[50px] w-full max-w-[425px] items-center gap-[15px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
                  <SearchIcon className="size-6 shrink-0 text-vess-grey-950" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search logs....."
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-normal leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-400 focus:outline-none"
                  />
                </label>
                <div className="flex items-center gap-5">
                  <FilterSelect
                    value={levelFilter}
                    options={[...LEVEL_OPTIONS]}
                    onChange={setLevelFilter}
                    ariaLabel="Filter by log level"
                  />
                  <FilterSelect
                    value={categoryFilter}
                    options={[...CATEGORY_OPTIONS]}
                    onChange={setCategoryFilter}
                    ariaLabel="Filter by category"
                  />
                </div>
              </div>

              <DeviceLogsList entries={filteredLogs} totalInDataset={allLogs.length} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

function FilterSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string
  options: string[]
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-[50px] gap-3 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
