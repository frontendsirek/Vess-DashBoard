import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowBackIcon,
  ConfigurationSectionIcon,
  DeleteOutlineIcon,
  EditOutlineIcon,
  ExecutionFailIcon,
  ExecutionSuccessIcon,
  RecentActivityIcon,
} from '@/components/icons'
import { Topbar } from '@/components/layout/Topbar'
import { buildTestDetailFromWizard, type TestDetailRecord, type TestStatus } from '@/data/mock'
import { useDeleteTestMutation } from '@/hooks/tests/use-delete-test-mutation'
import { mapApiProbeToTestDetailRecord } from '@/lib/api-test-mapper'
import { testQueryKeys } from '@/lib/test-query-keys'
import { cn } from '@/lib/utils'
import { testService } from '@/services/test.service'
import { useAuthStore } from '@/stores/auth-store'
import type { TestDetailFromWizardState } from '@/types/create-test'

function statusBadgeClass(status: TestStatus) {
  switch (status) {
    case 'Draft':
      return 'bg-vess-grey-100 text-vess-grey-800 min-w-[102px] px-3 py-1 text-[15px] font-normal leading-[18px]'
    case 'Ready':
      return 'bg-vess-green-50 text-vess-green-800 min-w-[102px] px-3 py-1 text-[15px] font-normal leading-[18px]'
    case 'Running':
      return 'bg-vess-primary-50 text-vess-primary-500 min-w-[102px] px-3 py-1 text-[15px] font-normal leading-[18px]'
    case 'Cancel requested':
      return 'bg-vess-secondary-50 text-vess-secondary-500 min-w-[102px] px-3 py-1 text-[15px] font-normal leading-[18px]'
    case 'Canceled':
      return 'bg-vess-red-50 text-vess-red-800 min-w-[102px] px-3 py-1 text-[15px] font-normal leading-[18px]'
    default:
      return ''
  }
}

export default function TestDetailPage() {
  const { testId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)

  const wizardDetail = useMemo(() => {
    const wizard = (location.state as TestDetailFromWizardState | null)?.wizardResult
    return wizard ? buildTestDetailFromWizard(wizard) : null
  }, [location.state])

  const trimId = testId.trim()

  const detailQuery = useQuery({
    queryKey: testQueryKeys.detail(accessToken, trimId),
    enabled: !!accessToken && !!trimId && !wizardDetail,
    queryFn: async () => {
      const { data } = await testService.getProbe(trimId)
      if (!data.isSuccess) {
        const msg = data.error?.description ?? data.message ?? 'Could not load test.'
        throw new Error(msg)
      }
      return data
    },
  })

  const apiDetail = useMemo(() => {
    if (!accessToken || !detailQuery.data) return null
    return mapApiProbeToTestDetailRecord(detailQuery.data.data)
  }, [accessToken, detailQuery.data])

  const detail = wizardDetail ?? (accessToken ? apiDetail : null)

  useEffect(() => {
    if (!trimId) {
      navigate('/test-management', { replace: true })
    }
  }, [trimId, navigate])

  const signedOutBlocked = !accessToken && !wizardDetail && !!trimId

  const authedBlocked = !!accessToken && !wizardDetail && !detailQuery.isSuccess

  const errorMessage =
    detailQuery.error instanceof Error ?
      detailQuery.error.message
    : 'Could not load test. Check your connection and try again.'

  return (
    <>
      <Topbar title="Test Management" subtitle="Test configuration & results" />
      <div className="px-5 py-6">
        {signedOutBlocked ?
          <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-6">
            <button
              type="button"
              onClick={() => navigate('/test-management')}
              className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
            >
              <ArrowBackIcon className="size-6" />
              <span className="text-[18px] font-light leading-[21.6px]">Back</span>
            </button>
            <p className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-[15px] text-vess-grey-800">
              Sign in to view this test from the API.
            </p>
          </div>
        : authedBlocked ?
          <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-6">
            <button
              type="button"
              onClick={() => navigate('/test-management')}
              className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
            >
              <ArrowBackIcon className="size-6" />
              <span className="text-[18px] font-light leading-[21.6px]">Back</span>
            </button>

            {detailQuery.isPending ?
              <div className="rounded-xl border border-vess-grey-100 bg-vess-grey-50 px-4 py-8 text-center text-[15px] text-vess-grey-600">
                Loading test…
              </div>
            : null}

            {!detailQuery.isPending && detailQuery.isError ?
              <div className="flex flex-col gap-4">
                <p className="rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[15px] text-vess-red-800">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  className="w-fit rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-2 text-[15px] font-medium text-vess-grey-950"
                  onClick={() => void detailQuery.refetch()}
                >
                  Try again
                </button>
              </div>
            : null}
          </div>
        : detail ?
          <TestDetailContent
            detail={detail}
            canDelete={!!accessToken && detail.id !== 'wizard'}
            canEdit={!!accessToken && detail.id !== 'wizard'}
            testId={detail.id}
            accessToken={accessToken}
          />
        : null}
      </div>
    </>
  )
}

function TestDetailContent({
  detail,
  canDelete,
  canEdit,
  testId,
  accessToken,
}: {
  detail: TestDetailRecord
  canDelete: boolean
  canEdit: boolean
  testId: string
  accessToken: string | null
}) {
  const navigate = useNavigate()
  const deleteMutation = useDeleteTestMutation(accessToken, testId)

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-6">
      <button
        type="button"
        onClick={() => navigate('/test-management')}
        className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
      >
        <ArrowBackIcon className="size-6" />
        <span className="text-[18px] font-light leading-[21.6px]">Back</span>
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">{detail.name}</h1>
        <div className="flex flex-wrap gap-5">
          <button
            type="button"
            disabled={!canEdit}
            onClick={() =>
              navigate(`/test-management/${encodeURIComponent(testId)}/edit/configure`)
            }
            className="inline-flex items-center justify-center gap-3 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <EditOutlineIcon className="size-6 text-vess-grey-950" />
            Edit
          </button>
          <button
            type="button"
            disabled={!canDelete || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="inline-flex items-center justify-center gap-3 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DeleteOutlineIcon className="size-6 text-vess-grey-950" />
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-vess-grey-200 bg-vess-grey-50 px-4 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">Status</span>
          <span
            className={cn('inline-flex items-center justify-center rounded-full', statusBadgeClass(detail.status))}
          >
            {detail.status}
          </span>
          {detail.status === 'Running' && detail.progressPercent !== undefined ?
            <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">
              ({detail.progressPercent}% complete)
            </span>
          : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[18px] text-vess-grey-950">
          <span className="font-light leading-[21.6px]">Last Execution</span>
          <span className="font-medium leading-[21.6px]">{detail.lastExecutionLabel}</span>
        </div>
      </div>

      {detail.status === 'Running' && detail.progressPercent !== undefined ?
        <div className="h-2 w-full overflow-hidden rounded-full bg-vess-grey-200">
          <div
            className="h-full rounded-full bg-vess-primary-500 transition-all"
            style={{ width: `${detail.progressPercent}%` }}
          />
        </div>
      : null}

      <div className="flex flex-col gap-5 md:flex-row">
        <Kpi label="Success Rate" value={detail.successRate} />
        <Kpi label="Avg Duration" value={detail.avgDuration} />
        <Kpi label="Total Runs" value={detail.totalRuns} />
      </div>

      <section className="flex flex-col gap-6 rounded-2xl border border-vess-grey-200 bg-vess-grey-50 px-4 py-5">
        <div className="flex items-center gap-3">
          <ConfigurationSectionIcon className="size-6 text-vess-grey-950" />
          <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Configuration</h2>
        </div>
        <div className="flex flex-col gap-6">
          {chunkPairs(detail.configRows, 2).map((pair, rowIdx) => (
            <div key={`row-${String(rowIdx)}`} className="flex flex-col gap-6 lg:flex-row lg:gap-6">
              {pair.map((cell) => (
                <div key={cell.label} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-24 gap-y-2">
                  <span className="w-[135px] shrink-0 text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                    {cell.label}
                  </span>
                  <span className="text-[18px] font-medium leading-[21.6px] text-vess-grey-950">{cell.value}</span>
                </div>
              ))}
            </div>
          ))}
          {detail.configRowsExtra ?
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-24 gap-y-2">
                <span className="w-[135px] shrink-0 text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                  {detail.configRowsExtra.label}
                </span>
                <span
                  className={cn(
                    'text-[18px] font-medium leading-[21.6px]',
                    detail.configRowsExtra.hideValue ? 'text-transparent' : 'text-vess-grey-950',
                  )}
                >
                  {detail.configRowsExtra.value}
                </span>
              </div>
            </div>
          : null}
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-2xl border border-vess-grey-200 bg-vess-grey-50 px-4 py-5">
        <div className="flex items-center gap-3">
          <RecentActivityIcon className="size-6 text-vess-grey-950" />
          <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Recent Executions</h2>
        </div>
        <div className="h-px w-full bg-vess-grey-200" />
        {detail.executions.length === 0 ?
          <p className="text-[18px] text-center font-light leading-[21.6px] text-vess-grey-950">
            {detail.executionsEmptyMessage ?? 'No executions yet'}
          </p>
        : <ExecutionsList executions={detail.executions} />}
      </section>
    </div>
  )
}

function ExecutionsList({ executions }: { executions: TestDetailRecord['executions'] }) {
  return (
    <ul className="flex flex-col">
      {executions.map((ex, i) => (
        <li key={ex.id}>
          {i > 0 && <div className="mb-4 h-px w-full bg-vess-grey-200" />}
          <div className="flex gap-3 pb-4">
            {ex.success ?
              <ExecutionSuccessIcon className="size-5 shrink-0" />
            : <ExecutionFailIcon className="size-5 shrink-0" />}
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-medium leading-[18px] text-vess-grey-950">{ex.timestamp}</p>
              <p className="text-[13px] font-normal leading-[15.6px] text-vess-grey-500">{ex.detail}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg border border-vess-grey-200 bg-vess-grey-50 px-4 py-5">
      <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">{label}</p>
      <p className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">{value}</p>
    </div>
  )
}

function chunkPairs<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}
