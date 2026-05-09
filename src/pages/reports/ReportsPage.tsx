import { Topbar } from '@/components/layout/Topbar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ReportsIcon, ActiveTestsIcon, DeviceGreenIcon, SpeedometerIcon } from '@/components/icons'
import { standardReports, type ReportCard } from '@/data/alerts-mock'

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

export default function ReportsPage() {
  return (
    <>
      <Topbar title="Reports & Analytics" subtitle="Reports & KPI trends" />

      <div className="flex flex-col gap-6 px-5 py-6">
        <h2 className="text-[24px] font-semibold leading-[30px] text-vess-grey-950">
          Reports & Analytics
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Reports" value="30" icon={ReportsIcon} iconBg="navy" />
          <KpiCard label="Scheduled" value="8" icon={ActiveTestsIcon} iconBg="green" />
          <KpiCard label="Last Report" value="2" icon={SpeedometerIcon} iconBg="amber" />
        </div>

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
                  <div className={`flex size-12 items-center justify-center rounded-full ${toneToBg[r.tone]}`}>
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

        <section className="rounded-2xl bg-vess-grey-50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
              Scheduled Reports
            </h3>
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-vess-grey-200 px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-vess-grey-950">No Scheduled Reports</p>
            <p className="mt-1 text-[13px] text-vess-grey-500">
              Schedule a report to see it appear here.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
