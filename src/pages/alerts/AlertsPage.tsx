import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { PageTabs } from '@/components/shared/PageTabs'
import { activeAlerts, stormDevices, type AlertSeverity } from '@/data/alerts-mock'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'feed', label: 'Alert Feed' },
  { id: 'rules', label: 'Alert Rules' },
  { id: 'history', label: 'Alert History' },
] as const

type TabId = (typeof tabs)[number]['id']

const severityChip: Record<AlertSeverity, string> = {
  critical: 'border-vess-red-500/40 bg-vess-red-50 text-vess-red-500',
  warning: 'border-vess-secondary-500/40 bg-vess-secondary-50 text-vess-secondary-500',
  info: 'border-vess-primary-500/40 bg-vess-primary-50 text-vess-primary-500',
}

const severityLabel: Record<AlertSeverity, string> = {
  critical: 'CRITICAL',
  warning: 'WARNING',
  info: 'INFO',
}

export default function AlertsPage() {
  const [tab, setTab] = useState<TabId>('feed')

  return (
    <>
      <Topbar title="Alerts & Notifications" subtitle="Notifications & alert rules" />

      <div className="flex flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[30px] text-vess-grey-950">
            Alerts & Notifications
          </h2>
          <PageTabs tabs={tabs} active={tab} onChange={setTab} />
        </div>

        {tab === 'feed' && (
          <>
            <AlertStormCard />
            <ActiveAlertsSection />
          </>
        )}

        {tab === 'rules' && <PlaceholderCard title="Alert Rules" />}
        {tab === 'history' && <PlaceholderCard title="Alert History" />}
      </div>
    </>
  )
}

function AlertStormCard() {
  return (
    <section className="rounded-2xl border border-vess-red-500/40 bg-vess-grey-50 p-6">
      <div className="flex items-center gap-3">
        <h3 className="text-[18px] font-semibold leading-6 text-vess-red-500">
          Alert Storm Detected
        </h3>
        <span className="rounded-md border border-vess-red-500/40 bg-vess-red-50 px-2 py-0.5 text-[11px] font-medium tracking-[0.4px] text-vess-red-500">
          CRITICAL
        </span>
      </div>

      <p className="mt-4 text-[15px] font-medium text-vess-grey-950">
        Multiple Device Offline Alerts
      </p>
      <p className="mt-1 text-[13px] font-light text-vess-grey-800">
        12 devices have gone offline in the last 2 minutes:
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {stormDevices.map((d) => (
          <li key={d} className="flex items-center gap-2 text-[14px] text-vess-red-500">
            <span className="size-1.5 rounded-full bg-vess-red-500" />
            {d}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-vess-red-500/30 bg-vess-red-50/60 px-3 py-2 text-[13px] text-vess-red-800">
        This may indicate a network-wide issue.
      </div>

      <div className="mt-4 text-[13px] font-light text-vess-grey-800">
        First detected: 2 minutes ago
        <br />
        Last Update: Just now (monitoring...)
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-xl bg-vess-primary-500 py-3 text-[14px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
        >
          View all affected devices
        </button>
        <button
          type="button"
          className="rounded-xl bg-vess-green-50 py-3 text-[14px] font-medium text-vess-green-800 transition-colors hover:bg-vess-green-50/80"
        >
          Acknowledge all
        </button>
      </div>
    </section>
  )
}

function ActiveAlertsSection() {
  return (
    <section className="rounded-2xl bg-vess-grey-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
          Active Alerts
        </h3>
        <button
          type="button"
          className="rounded-lg border border-vess-grey-200 bg-vess-grey-50 px-3 py-1.5 text-[13px] font-medium text-vess-grey-800"
        >
          All ▾
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {activeAlerts.map((a) => (
          <article
            key={a.id}
            className="flex flex-col gap-3 rounded-xl bg-vess-grey-100 p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-[0.4px]',
                  severityChip[a.severity],
                )}
              >
                {severityLabel[a.severity]}
              </span>
              {a.ack && (
                <span className="rounded-md bg-vess-grey-200 px-2 py-0.5 text-[11px] tracking-[0.4px] text-vess-grey-800">
                  Acknowledge
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-[15px] font-semibold text-vess-grey-950">{a.title}</p>
                <span className="text-[12px] text-vess-grey-500">{a.timestamp}</span>
              </div>
              <p className="mt-1 text-[13px] text-vess-grey-800">{a.body}</p>
            </div>
            <div className="flex items-center justify-between">
              {!a.ack ? (
                <button
                  type="button"
                  className="rounded-md border border-vess-red-500/40 bg-vess-red-50 px-3 py-1 text-[12px] font-medium text-vess-red-500"
                >
                  Acknowledge
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="text-[13px] font-medium text-vess-primary-500"
              >
                View details →
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlaceholderCard({ title }: { title: string }) {
  return (
    <section className="rounded-2xl bg-vess-grey-50 p-12 text-center">
      <p className="text-[16px] font-medium text-vess-grey-950">{title}</p>
      <p className="mt-2 text-[13px] text-vess-grey-500">Coming next.</p>
    </section>
  )
}
