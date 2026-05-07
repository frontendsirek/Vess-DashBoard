import { useMemo, useState } from 'react'
import { ActiveTestsIcon, CheckCircleIcon, FailedTestsIcon, SpeedometerIcon } from '@/components/icons'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Topbar } from '@/components/layout/Topbar'
import { Pagination } from '@/components/test-management/Pagination'
import { TestCardGrid } from '@/components/test-management/TestCardGrid'
import { TestFilterBar } from '@/components/test-management/TestFilterBar'
import { TestManagementHeader } from '@/components/test-management/TestManagementHeader'
import { TestTable } from '@/components/test-management/TestTable'
import { type TestRecord, tests as allTests } from '@/data/mock'
import { useUiStore } from '@/stores/ui-store'

export default function TestManagementPage() {
  const view = useUiStore((state) => state.testManagementView)
  const setView = useUiStore((state) => state.setTestManagementView)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(4)

  const filteredTests = useMemo<TestRecord[]>(() => {
    return allTests.filter((test) => {
      if (search && !test.name.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'All Types' && test.type !== typeFilter) return false
      if (statusFilter !== 'All Status' && test.status !== statusFilter) return false
      return true
    })
  }, [search, typeFilter, statusFilter])

  return (
    <>
      <Topbar title="Test Management" subtitle="Test configuration & results" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <TestManagementHeader />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Tests" value="42" icon={ActiveTestsIcon} iconBg="navy" />
          <KpiCard label="Completed Today" value="12" icon={CheckCircleIcon} iconBg="green" />
          <KpiCard label="Failed Tests" value="3" icon={FailedTestsIcon} iconBg="red" />
          <KpiCard
            label="AVG. Network Speed"
            value={
              <>
                50 <span className="text-[18px] font-normal leading-[21.6px]">Mbps</span>
              </>
            }
            icon={SpeedometerIcon}
            iconBg="amber"
          />
        </div>

        <section className="flex flex-col gap-6 rounded-2xl bg-vess-grey-50 p-4">
          <header className="flex flex-col gap-6">
            <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">
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

          {view === 'list' ? (
            <TestTable tests={filteredTests} />
          ) : (
            <TestCardGrid tests={filteredTests} />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={30}
            onChange={setCurrentPage}
          />
        </section>
      </div>
    </>
  )
}
