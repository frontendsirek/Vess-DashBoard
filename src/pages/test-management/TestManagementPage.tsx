import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActiveTestsIcon, CheckCircleIcon, FailedTestsIcon, SpeedometerIcon } from '@/components/icons'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Pagination } from '@/components/test-management/Pagination'
import { TestCardGrid } from '@/components/test-management/TestCardGrid'
import { CreateNewTestModal } from '@/components/test-management/create-test/CreateNewTestModal'
import { TestFilterBar } from '@/components/test-management/TestFilterBar'
import { TestManagementHeader } from '@/components/test-management/TestManagementHeader'
import { TestTable } from '@/components/test-management/TestTable'
import { type TestRecord } from '@/data/mock'
import {
  mapApiProbeToTestRecord,
  mapUiDeliveryStatusFilterToApi,
  mapUiTestTypeFilterToApi,
} from '@/lib/api-test-mapper'
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value'
import { useTestsDashboardQuery } from '@/hooks/tests/use-tests-dashboard-query'
import { useTestsListQuery } from '@/hooks/tests/use-tests-list-query'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'
import type { CreateTestStep1Draft } from '@/types/create-test'
import type { ListProbesParams, TestsDashboardParams } from '@/types/test'

const PAGE_SIZE = 10

function formatDashboardMbps(mbps: number | undefined): string {
  if (mbps === undefined || !Number.isFinite(mbps)) return '—'
  return mbps % 1 === 0 ? String(mbps) : mbps.toFixed(1)
}

export default function TestManagementPage() {
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const view = useUiStore((state) => state.testManagementView)
  const setView = useUiStore((state) => state.setTestManagementView)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, statusFilter, debouncedSearch])

  const listParams = useMemo((): ListProbesParams => {
    const params: ListProbesParams = {
      page: currentPage,
      pageSize: PAGE_SIZE,
    }
    if (debouncedSearch.length > 0) {
      params.search = debouncedSearch
    }
    const typeApi = mapUiTestTypeFilterToApi(typeFilter)
    if (typeApi !== undefined) {
      params.type = typeApi
    }
    const deliveryApi = mapUiDeliveryStatusFilterToApi(statusFilter)
    if (deliveryApi !== undefined) {
      params.deliveryStatus = deliveryApi
    }
    return params
  }, [currentPage, debouncedSearch, typeFilter, statusFilter])

  const dashboardParams = useMemo((): TestsDashboardParams => {
    const params: TestsDashboardParams = {}
    if (debouncedSearch.length > 0) {
      params.search = debouncedSearch
    }
    const typeApi = mapUiTestTypeFilterToApi(typeFilter)
    if (typeApi !== undefined) {
      params.type = typeApi
    }
    const deliveryApi = mapUiDeliveryStatusFilterToApi(statusFilter)
    if (deliveryApi !== undefined) {
      params.deliveryStatus = deliveryApi
    }
    return params
  }, [debouncedSearch, typeFilter, statusFilter])

  const dashboardQuery = useTestsDashboardQuery(accessToken, dashboardParams)

  const listQuery = useTestsListQuery(accessToken, listParams)

  const apiTests = useMemo(() => {
    const items = listQuery.data?.data.items ?? []
    return items.map(mapApiProbeToTestRecord)
  }, [listQuery.data])

  const displayedTests = accessToken ? apiTests : []

  const totalPages =
    accessToken ? Math.max(1, listQuery.data?.data.pageable.totalPages ?? 1) : 1

  const listPending = !!accessToken && listQuery.isPending
  const listError = !!accessToken && listQuery.isError

  const rowsOnPage = displayedTests

  function handleViewTest(test: TestRecord) {
    navigate(`/test-management/${test.id}`)
  }

  function handleContinueCreateTest(draft: CreateTestStep1Draft) {
    setCreateModalOpen(false)
    navigate('/test-management/new/configure', { state: { step1: draft } })
  }

  const errorMessage =
    listQuery.error instanceof Error ? listQuery.error.message : 'Could not load tests. Check your connection and try again.'

  const dashboardSummary = dashboardQuery.data?.data.summary

  const dashboardErrorMessage =
    dashboardQuery.error instanceof Error ?
      dashboardQuery.error.message
    : 'Could not load test dashboard metrics. Check your connection and try again.'

  function kpiCountDisplay(fromSummary: number | undefined): string {
    if (!accessToken) return '0'
    if (dashboardQuery.isPending || dashboardQuery.isError) return '—'
    if (fromSummary === undefined || !Number.isFinite(fromSummary)) return '—'
    return String(fromSummary)
  }

  const kpiActive = kpiCountDisplay(dashboardSummary?.activeTests)
  const kpiCompletedToday = kpiCountDisplay(dashboardSummary?.completedToday)
  const kpiFailed = kpiCountDisplay(dashboardSummary?.failedTests)

  const kpiSpeed =
    !accessToken ? '—'
    : dashboardQuery.isPending || dashboardQuery.isError ? '—'
    : formatDashboardMbps(dashboardSummary?.avgNetworkSpeedMbps)

  const kpiSpeedSuffix = kpiSpeed !== '—' ? 'Mbps' : undefined

  const dashboardErrorBanner = !!accessToken && dashboardQuery.isError

  const showPagination = accessToken && !listPending && totalPages > 1

  return (
    <>
      <CreateNewTestModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onContinue={handleContinueCreateTest}
      />

      <div className="flex flex-col gap-4 px-5 py-6">
        <TestManagementHeader onNewTest={() => setCreateModalOpen(true)} />

        {dashboardErrorBanner && (
          <p className="rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[13px] text-vess-red-800">
            {dashboardErrorMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Tests" value={kpiActive} icon={ActiveTestsIcon} iconBg="navy" />
          <KpiCard label="Completed Today" value={kpiCompletedToday} icon={CheckCircleIcon} iconBg="green" />
          <KpiCard label="Failed Tests" value={kpiFailed} icon={FailedTestsIcon} iconBg="red" />
          <KpiCard
            label="AVG. Network Speed"
            value={kpiSpeed}
            suffix={kpiSpeedSuffix}
            icon={SpeedometerIcon}
            iconBg="amber"
          />
        </div>

        <section className="flex flex-col gap-6 rounded-2xl bg-vess-grey-50 p-4">
          <header className="flex flex-col gap-6">
            <h2 className="text-[18px] font-medium leading-6 text-vess-grey-950">
              Test Management List
            </h2>
            <TestFilterBar
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              view={view}
              onViewChange={setView}
            />
          </header>

          {!accessToken && (
            <p className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-[13px] text-vess-grey-800">
              Sign in to load tests from the API.
            </p>
          )}

          {listError && (
            <p className="rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[13px] text-vess-red-800">
              {errorMessage}
            </p>
          )}

          {listPending ? (
            <div className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-8 text-center text-[13px] text-vess-grey-600">
              Loading tests…
            </div>
          ) : (
            <>
              {view === 'list' ?
                <TestTable tests={rowsOnPage} onView={handleViewTest} />
              : <TestCardGrid tests={rowsOnPage} onView={handleViewTest} />}
              {!listPending && !listError && accessToken && displayedTests.length === 0 ?
                <p className="py-2 text-center text-[12px] text-vess-grey-500">No tests match your filters.</p>
              : null}
            </>
          )}

          {showPagination ?
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          : null}
        </section>
      </div>
    </>
  )
}
