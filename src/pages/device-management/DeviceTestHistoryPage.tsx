import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { DeviceTestHistoryTable } from '@/components/device-management/DeviceTestHistoryTable'
import {
  ActiveTestsIcon,
  ArrowBackIcon,
  CheckCircleIcon,
  ExportDownloadIcon,
  FailedTestsIcon,
  SearchIcon,
  SpeedometerIcon,
} from '@/components/icons'
import { Pagination } from '@/components/test-management/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  deviceTestHistoryKindLabel,
  deviceTestHistorySummary,
  deviceTestHistorySummaryFromApiSummary,
} from '@/data/device-management'
import { useDeviceDetailQuery } from '@/hooks/devices/use-device-detail-query'
import { useDeviceTestHistoryQuery } from '@/hooks/devices/use-device-test-history-query'
import { useDeviceTestSummaryQuery } from '@/hooks/devices/use-device-test-summary-query'
import { mapRecentTestsToDeviceTestHistoryRows } from '@/lib/map-device-recent-tests-to-history-rows'
import { useAuthStore } from '@/stores/auth-store'

const PAGE_SIZE = 4
const TEST_HISTORY_FETCH_SIZE = 100

const TYPE_OPTIONS = ['All Types', 'Call Test', 'SMS Test', 'USSD Test'] as const

const STATUS_OPTIONS = ['All Status', 'Success', 'Failed', 'Running'] as const

export default function DeviceTestHistoryPage() {
  const { deviceId = '' } = useParams()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const apiQueryEnabled = Boolean(accessToken?.length && deviceId.trim())
  const apiDeviceQuery = useDeviceDetailQuery(accessToken, deviceId, apiQueryEnabled)
  const testHistoryQuery = useDeviceTestHistoryQuery(
    accessToken,
    deviceId,
    { page: 1, page_size: TEST_HISTORY_FETCH_SIZE },
    apiQueryEnabled,
  )
  const testSummaryQuery = useDeviceTestSummaryQuery(accessToken, deviceId, apiQueryEnabled)

  const allRows = useMemo(() => {
    return mapRecentTestsToDeviceTestHistoryRows(deviceId, testHistoryQuery.data?.results)
  }, [deviceId, testHistoryQuery.data?.results])

  const summary = useMemo(() => {
    if (testSummaryQuery.data) {
      return deviceTestHistorySummaryFromApiSummary(testSummaryQuery.data)
    }
    return deviceTestHistorySummary(allRows)
  }, [allRows, testSummaryQuery.data])

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>(TYPE_OPTIONS[0])
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_OPTIONS[0])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!deviceId.trim()) {
      navigate('/device-management', { replace: true })
    }
  }, [deviceId, navigate])

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      if (typeFilter !== TYPE_OPTIONS[0] && deviceTestHistoryKindLabel(row.kind) !== typeFilter)
        return false
      if (statusFilter !== STATUS_OPTIONS[0] && row.outcome !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const hay =
          `${row.targetMsisdn} ${row.detailLine} ${deviceTestHistoryKindLabel(row.kind)}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [allRows, search, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const paginationPage = Math.min(currentPage, totalPages)

  const paginatedRows = useMemo(() => {
    const start = (paginationPage - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, paginationPage])

  const deviceDisplayName = apiDeviceQuery.data?.device_name ?? ''
  const isPageLoading =
    apiDeviceQuery.isPending || testHistoryQuery.isPending || testSummaryQuery.isPending
  const pageLoadError =
    apiDeviceQuery.isError
      ? apiDeviceQuery.error
      : testHistoryQuery.isError
        ? testHistoryQuery.error
        : testSummaryQuery.isError
          ? testSummaryQuery.error
          : null

  if (!deviceId.trim()) {
    return null
  }

  if (!accessToken?.length) {
    return (
      <>
        <div className="flex flex-col gap-4 px-5 py-6">
          <p className="text-center text-[15px] text-vess-grey-800">
            Sign in to load this device&apos;s test history.
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

  if (isPageLoading) {
    return (
      <>
        <div className="px-5 py-6">
          <p className="text-center text-[15px] text-vess-grey-600">Loading device…</p>
        </div>
      </>
    )
  }

  if (pageLoadError) {
    const errMsg = pageLoadError instanceof Error ? pageLoadError.message : 'Request failed.'
    return (
      <>
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

  return (
    <>
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
              <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">Test History</h1>
              <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">{deviceDisplayName}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-3 rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
            >
              <ExportDownloadIcon className="size-6 shrink-0 text-vess-primary-500" />
              Export
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total Tests"
              value={String(summary.total)}
              icon={ActiveTestsIcon}
              iconBg="navy"
            />
            <KpiCard
              label="Successful Tests"
              value={String(summary.successful)}
              icon={CheckCircleIcon}
              iconBg="green"
            />
            <KpiCard
              label="Failed Tests"
              value={String(summary.failed)}
              icon={FailedTestsIcon}
              iconBg="red"
            />
            <KpiCard
              label="AVG. Network Speed"
              value={
                <>
                  {summary.avgMbps}{' '}
                  <span className="text-[18px] font-normal leading-[21.6px]">Mbps</span>
                </>
              }
              icon={SpeedometerIcon}
              iconBg="amber"
            />
          </div>

          <section className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Test History List</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex h-[50px] w-full max-w-[425px] items-center gap-3.5 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
                  <SearchIcon className="size-6 shrink-0 text-vess-grey-950" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tests....."
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-normal leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-400 focus:outline-none"
                  />
                </label>

                <div className="flex items-center gap-5">
                  <FilterSelect
                    value={statusFilter}
                    options={[...STATUS_OPTIONS]}
                    onChange={setStatusFilter}
                    ariaLabel="Filter by status"
                  />
                  <FilterSelect
                    value={typeFilter}
                    options={[...TYPE_OPTIONS]}
                    onChange={setTypeFilter}
                    ariaLabel="Filter by type"
                  />
                </div>
              </div>

              <DeviceTestHistoryTable rows={paginatedRows} />

              <Pagination currentPage={paginationPage} totalPages={totalPages} onChange={setCurrentPage} />
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
