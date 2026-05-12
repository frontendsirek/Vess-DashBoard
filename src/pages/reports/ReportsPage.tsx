import { useState } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Topbar } from '@/components/layout/Topbar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PageTabs } from '@/components/shared/PageTabs'
import { ReportsIcon, ActiveTestsIcon, DeviceGreenIcon, SpeedometerIcon } from '@/components/icons'
import { standardReports, type ReportCard } from '@/data/alerts-mock'
import { vessColors } from '@/design/colors'
import { cn } from '@/lib/utils'

const iconMap = {
  doc: ReportsIcon,
  device: DeviceGreenIcon,
  compare: SpeedometerIcon,
  chart: ActiveTestsIcon,
} as const

const toneToBg: Record<ReportCard['tone'], string> = {
  navy: 'bg-vess-primary-50',
  green: 'bg-vess-green-50',
  amber: 'bg-vess-secondary-50',
  red: 'bg-vess-red-50',
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'templates', label: 'Report Templates' },
  { id: 'generated', label: 'Generated Reports' },
  { id: 'scheduled', label: 'Scheduled' },
] as const

type TabId = (typeof tabs)[number]['id']

const weeklyTestData = [
  { day: 'Mon', success: 45, failed: 3 },
  { day: 'Tue', success: 52, failed: 5 },
  { day: 'Wed', success: 38, failed: 2 },
  { day: 'Thu', success: 48, failed: 4 },
  { day: 'Fri', success: 55, failed: 6 },
  { day: 'Sat', success: 30, failed: 1 },
  { day: 'Sun', success: 25, failed: 0 },
]

const networkBreakdown = [
  { name: '4G LTE', value: 45, color: vessColors.primary[500] },
  { name: '5G NR', value: 25, color: vessColors.green[500] },
  { name: '3G UMTS', value: 20, color: vessColors.secondary[500] },
  { name: '2G GSM', value: 10, color: vessColors.red[500] },
]

type GeneratedReport = {
  id: string
  title: string
  type: string
  generatedAt: string
  size: string
  status: 'ready' | 'generating' | 'failed'
}

const generatedReports: GeneratedReport[] = [
  { id: 'gr-1', title: 'Weekly Test Execution Report',       type: 'Test Execution',     generatedAt: 'May 12, 2026 09:00', size: '2.4 MB', status: 'ready' },
  { id: 'gr-2', title: 'Network Performance — Lagos Region', type: 'Network Performance', generatedAt: 'May 11, 2026 18:30', size: '1.8 MB', status: 'ready' },
  { id: 'gr-3', title: 'Device Health Summary — May W2',     type: 'Device Health',       generatedAt: 'May 11, 2026 12:00', size: '3.1 MB', status: 'ready' },
  { id: 'gr-4', title: 'Comparative Analysis Q1 vs Q2',      type: 'Comparative',         generatedAt: 'May 10, 2026 15:45', size: '—',      status: 'generating' },
  { id: 'gr-5', title: 'Monthly Device Health Report',       type: 'Device Health',       generatedAt: 'May 09, 2026 08:00', size: '4.2 MB', status: 'ready' },
]

type ScheduledReport = {
  id: string
  title: string
  frequency: string
  nextRun: string
  lastRun: string
  recipients: number
  enabled: boolean
}

const scheduledReports: ScheduledReport[] = [
  { id: 'sr-1', title: 'Daily Test Summary',    frequency: 'Daily at 08:00', nextRun: 'May 13, 2026 08:00', lastRun: 'May 12, 2026 08:00', recipients: 3, enabled: true },
  { id: 'sr-2', title: 'Weekly Network Report', frequency: 'Every Monday',  nextRun: 'May 19, 2026 09:00', lastRun: 'May 12, 2026 09:00', recipients: 5, enabled: true },
  { id: 'sr-3', title: 'Monthly Device Health', frequency: 'First of month', nextRun: 'Jun 01, 2026 08:00', lastRun: 'May 01, 2026 08:00', recipients: 4, enabled: false },
]

export default function ReportsPage() {
  const [tab, setTab] = useState<TabId>('overview')

  return (
    <>
      <Topbar title="Reports & Analytics" subtitle="Reports & KPI trends" />

      <div className="flex flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[30px] text-vess-grey-950">
            Reports & Analytics
          </h2>
          <PageTabs tabs={tabs} active={tab} onChange={setTab} />
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'generated' && <GeneratedTab />}
        {tab === 'scheduled' && <ScheduledTab />}
      </div>
    </>
  )
}

function OverviewTab() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Reports" value="30" icon={ReportsIcon} iconBg="navy" />
        <KpiCard
          label="Scheduled"
          value="8"
          icon={ActiveTestsIcon}
          iconBg="green"
          delta={{ value: '2', direction: 'up', tone: 'green', caption: 'this week' }}
        />
        <KpiCard label="Avg Generation" value="45s" icon={SpeedometerIcon} iconBg="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
        <section className="rounded-2xl bg-vess-grey-50 p-5">
          <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
            Weekly Test Volume
          </h3>
          <p className="mt-1 text-[13px] text-vess-grey-500">
            Successful vs failed tests this week
          </p>
          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyTestData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke={vessColors.grey[200]}
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: vessColors.grey[500], fontSize: 13 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: vessColors.grey[500], fontSize: 13 }}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: vessColors.grey[100] }}
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="success"
                  fill={vessColors.green[500]}
                  radius={[4, 4, 0, 0]}
                  name="Successful"
                />
                <Bar
                  dataKey="failed"
                  fill={vessColors.red[500]}
                  radius={[4, 4, 0, 0]}
                  name="Failed"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-5 text-[13px]">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-vess-green-500" />
              Successful
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-vess-red-500" />
              Failed
            </span>
          </div>
        </section>

        <section className="rounded-2xl bg-vess-grey-50 p-5">
          <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
            Network Distribution
          </h3>
          <p className="mt-1 text-[13px] text-vess-grey-500">
            Test coverage by network type
          </p>
          <div className="mt-4 flex items-center justify-center">
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={networkBreakdown}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {networkBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {networkBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[13px]">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-vess-grey-800">{item.name}</span>
                <span className="ml-auto font-medium text-vess-grey-950">{item.value}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function TemplatesTab() {
  return (
    <section className="rounded-2xl bg-vess-grey-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
          Standard Reports
        </h3>
        <button
          type="button"
          className="rounded-xl bg-vess-primary-500 px-4 py-2 text-[14px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
        >
          Custom Report
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {standardReports.map((r) => {
          const Icon = iconMap[r.icon]
          return (
            <article
              key={r.id}
              className="flex flex-col gap-4 rounded-xl border border-vess-grey-200 bg-vess-grey-50 p-5"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-full ${toneToBg[r.tone]}`}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-vess-grey-950">{r.title}</p>
                <p className="mt-1 text-[13px] text-vess-grey-800">{r.description}</p>
              </div>
              <p className="text-[12px] text-vess-grey-500">{r.meta}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-vess-primary-500 py-2 text-[13px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
                >
                  Generate now
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-vess-grey-200 py-2 text-[13px] font-medium text-vess-grey-800 transition-colors hover:bg-vess-grey-100"
                >
                  Quick preview
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const reportStatusChip: Record<GeneratedReport['status'], string> = {
  ready: 'bg-vess-green-50 text-vess-green-800',
  generating: 'bg-vess-secondary-50 text-vess-secondary-500',
  failed: 'bg-vess-red-50 text-vess-red-500',
}

function GeneratedTab() {
  return (
    <section className="rounded-2xl bg-vess-grey-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
            Generated Reports
          </h3>
          <p className="mt-1 text-[13px] text-vess-grey-500">
            Download or view previously generated reports
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="text-[13px] text-vess-grey-800">
            <tr className="border-b border-vess-grey-200">
              <th className="py-3 font-medium">Report</th>
              <th className="py-3 font-medium">Type</th>
              <th className="py-3 font-medium">Generated</th>
              <th className="py-3 font-medium">Size</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {generatedReports.map((r) => (
              <tr key={r.id} className="border-b border-vess-grey-200/70">
                <td className="py-4">
                  <p className="font-medium text-vess-grey-950">{r.title}</p>
                </td>
                <td className="py-4">
                  <span className="rounded-md bg-vess-grey-100 px-2 py-0.5 text-[12px] text-vess-grey-800">
                    {r.type}
                  </span>
                </td>
                <td className="py-4 text-[13px] text-vess-grey-800">{r.generatedAt}</td>
                <td className="py-4 text-[13px] text-vess-grey-800">{r.size}</td>
                <td className="py-4">
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[12px] font-medium capitalize',
                      reportStatusChip[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-4">
                  {r.status === 'ready' ? (
                    <button
                      type="button"
                      className="text-[13px] font-medium text-vess-primary-500 transition-opacity hover:opacity-80"
                    >
                      Download
                    </button>
                  ) : r.status === 'generating' ? (
                    <span className="text-[13px] text-vess-grey-500">Processing…</span>
                  ) : (
                    <button
                      type="button"
                      className="text-[13px] font-medium text-vess-red-500 transition-opacity hover:opacity-80"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ScheduledTab() {
  const [schedules, setSchedules] = useState(scheduledReports)

  function handleToggle(scheduleId: string) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, enabled: !s.enabled } : s)),
    )
  }

  return (
    <section className="rounded-2xl bg-vess-grey-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
            Scheduled Reports
          </h3>
          <p className="mt-1 text-[13px] text-vess-grey-500">
            Automate report generation on a recurring schedule
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-vess-primary-500 px-4 py-2 text-[14px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
        >
          + Schedule Report
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {schedules.map((s) => (
          <article
            key={s.id}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-5 transition-colors sm:flex-row sm:items-center sm:justify-between',
              s.enabled
                ? 'border-vess-grey-200 bg-vess-grey-50'
                : 'border-vess-grey-200/60 bg-vess-grey-100/50',
            )}
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-[15px] font-semibold text-vess-grey-950">{s.title}</h4>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-vess-grey-500">
                <span className="rounded-md bg-vess-grey-100 px-2 py-0.5">{s.frequency}</span>
                <span>Next: {s.nextRun}</span>
                <span>Last: {s.lastRun}</span>
                <span>{s.recipients} recipient{s.recipients !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-[13px] font-medium text-vess-primary-500 transition-opacity hover:opacity-80"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleToggle(s.id)}
                aria-label={`Toggle ${s.title}`}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
                  s.enabled ? 'bg-vess-green-500' : 'bg-vess-grey-300',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                    s.enabled ? 'translate-x-[22px]' : 'translate-x-[2px]',
                    'mt-[2px]',
                  )}
                />
              </button>
            </div>
          </article>
        ))}

        {schedules.length === 0 && (
          <div className="rounded-xl border border-dashed border-vess-grey-200 px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-vess-grey-950">No Scheduled Reports</p>
            <p className="mt-1 text-[13px] text-vess-grey-500">
              Schedule a report to see it appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
