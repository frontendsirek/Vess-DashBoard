import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActiveTestsIcon, CheckCircleIcon, FailedTestsIcon, SpeedometerIcon } from '@/components/icons'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Topbar } from '@/components/layout/Topbar'
import { Pagination } from '@/components/test-management/Pagination'
import { TestCardGrid } from '@/components/test-management/TestCardGrid'
import { CreateNewTestModal } from '@/components/test-management/create-test/CreateNewTestModal'
import { TestFilterBar } from '@/components/test-management/TestFilterBar'
import { TestManagementHeader } from '@/components/test-management/TestManagementHeader'
import { TestTable } from '@/components/test-management/TestTable'
import { type TestRecord, tests as allTests } from '@/data/mock'
import { useUiStore } from '@/stores/ui-store'
import type { CreateTestStep1Draft } from '@/types/create-test'

export default function TestManagementPage() {
  const navigate = useNavigate()
  const view = useUiStore((state) => state.testManagementView)
  const setView = useUiStore((state) => state.setTestManagementView)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(4)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const filteredTests = useMemo<TestRecord[]>(() => {
    return allTests.filter((test) => {
      if (search && !test.name.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter !== 'All Types' && test.type !== typeFilter) return false
      if (statusFilter !== 'All Status' && test.status !== statusFilter) return false
      return true
    })
  }, [search, typeFilter, statusFilter])

  function handleViewTest(test: TestRecord) {
    navigate(`/test-management/${test.id}`)
  }

  function handleContinueCreateTest(draft: CreateTestStep1Draft) {
    setCreateModalOpen(false)
    navigate('/test-management/new/configure', { state: { step1: draft } })
  }

  return (
    <>
      <Topbar title="Test Management" subtitle="Test configuration & results" />

      <CreateNewTestModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onContinue={handleContinueCreateTest}
      />

      <div className="flex flex-col gap-4 px-5 py-6">
        <TestManagementHeader onNewTest={() => setCreateModalOpen(true)} />

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
            <TestTable tests={filteredTests} onView={handleViewTest} />
          ) : (
            <TestCardGrid tests={filteredTests} onView={handleViewTest} />
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
