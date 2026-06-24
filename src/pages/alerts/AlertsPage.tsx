import { useState } from 'react'
import { PageTabs } from '@/components/shared/PageTabs'
import {
  activeAlerts,
  alertHistory,
  alertRules,
  stormDevices,
  type AlertHistoryMock,
  type AlertRuleMock,
  type AlertSeverity,
} from '@/data/alerts-mock'
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
      <div className="flex flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-[22px] font-semibold leading-[30px] text-vess-grey-950">
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

        {tab === 'rules' && <AlertRulesSection />}
        {tab === 'history' && <AlertHistorySection />}
      </div>
    </>
  )
}

function AlertStormCard() {
  return (
    <section className="rounded-2xl border border-vess-red-500/40 bg-vess-grey-50 p-6">
      <div className="flex items-center gap-3">
        <h3 className="text-[16px] font-semibold leading-6 text-vess-red-500">
          Alert Storm Detected
        </h3>
        <span className="rounded-md border border-vess-red-500/40 bg-vess-red-50 px-2 py-0.5 text-[10px] font-medium tracking-[0.4px] text-vess-red-500">
          CRITICAL
        </span>
      </div>

      <p className="mt-4 text-[13px] font-medium text-vess-grey-950">
        Multiple Device Offline Alerts
      </p>
      <p className="mt-1 text-[11px] font-light text-vess-grey-800">
        12 devices have gone offline in the last 2 minutes:
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {stormDevices.map((d) => (
          <li key={d} className="flex items-center gap-2 text-[12px] text-vess-red-500">
            <span className="size-1.5 rounded-full bg-vess-red-500" />
            {d}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-vess-red-500/30 bg-vess-red-50/60 px-3 py-2 text-[11px] text-vess-red-800">
        This may indicate a network-wide issue.
      </div>

      <div className="mt-4 text-[11px] font-light text-vess-grey-800">
        First detected: 2 minutes ago
        <br />
        Last Update: Just now (monitoring...)
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-xl bg-vess-primary-500 py-3 text-[12px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
        >
          View all affected devices
        </button>
        <button
          type="button"
          className="rounded-xl bg-vess-green-50 py-3 text-[12px] font-medium text-vess-green-800 transition-colors hover:bg-vess-green-50/80"
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
        <h3 className="text-[16px] font-semibold leading-6 text-vess-grey-950">
          Active Alerts
        </h3>
        <button
          type="button"
          className="rounded-lg border border-vess-grey-200 bg-vess-grey-50 px-3 py-1.5 text-[11px] font-medium text-vess-grey-800"
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
                  'rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-[0.4px]',
                  severityChip[a.severity],
                )}
              >
                {severityLabel[a.severity]}
              </span>
              {a.ack && (
                <span className="rounded-md bg-vess-grey-200 px-2 py-0.5 text-[10px] tracking-[0.4px] text-vess-grey-800">
                  Acknowledge
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-[13px] font-semibold text-vess-grey-950">{a.title}</p>
                <span className="text-[11px] text-vess-grey-500">{a.timestamp}</span>
              </div>
              <p className="mt-1 text-[11px] text-vess-grey-800">{a.body}</p>
            </div>
            <div className="flex items-center justify-between">
              {!a.ack ? (
                <button
                  type="button"
                  className="rounded-md border border-vess-red-500/40 bg-vess-red-50 px-3 py-1 text-[11px] font-medium text-vess-red-500"
                >
                  Acknowledge
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="text-[11px] font-medium text-vess-primary-500"
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

function AlertRulesSection() {
  const [rules, setRules] = useState(alertRules)

  function handleToggle(ruleId: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  return (
    <section className="rounded-2xl bg-vess-grey-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold leading-6 text-vess-grey-950">
            Alert Rules
          </h3>
          <p className="mt-1 text-[11px] text-vess-grey-500">
            Configure when and how alerts are triggered
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-vess-primary-500 px-4 py-2 text-[12px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
        >
          + New Rule
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {rules.map((rule) => (
          <AlertRuleCard
            key={rule.id}
            rule={rule}
            onToggle={() => handleToggle(rule.id)}
          />
        ))}
      </div>
    </section>
  )
}

function AlertRuleCard({
  rule,
  onToggle,
}: {
  rule: AlertRuleMock
  onToggle: () => void
}) {
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-5 transition-colors',
        rule.enabled
          ? 'border-vess-grey-200 bg-vess-grey-50'
          : 'border-vess-grey-200/60 bg-vess-grey-100/50',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-[0.4px]',
              severityChip[rule.severity],
            )}
          >
            {severityLabel[rule.severity]}
          </span>
          <h4 className="text-[13px] font-semibold text-vess-grey-950">{rule.name}</h4>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={`Toggle ${rule.name}`}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
            rule.enabled ? 'bg-vess-green-500' : 'bg-vess-grey-300',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
              rule.enabled ? 'translate-x-[22px]' : 'translate-x-[2px]',
              'mt-[2px]',
            )}
          />
        </button>
      </div>

      <p className="text-[11px] text-vess-grey-800">{rule.description}</p>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-vess-grey-500">
        <span className="rounded-md bg-vess-grey-100 px-2 py-0.5 font-mono text-[10px]">
          {rule.condition}
        </span>
        <span>Last triggered: {rule.lastTriggered}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-[11px] font-medium text-vess-primary-500 transition-opacity hover:opacity-80"
        >
          Edit rule
        </button>
        <span className="text-vess-grey-300">|</span>
        <button
          type="button"
          className="text-[11px] font-medium text-vess-red-500 transition-opacity hover:opacity-80"
        >
          Delete
        </button>
      </div>
    </article>
  )
}

function AlertHistorySection() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all')

  const filtered =
    statusFilter === 'all'
      ? alertHistory
      : alertHistory.filter((h) => h.status === statusFilter)

  return (
    <section className="rounded-2xl bg-vess-grey-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold leading-6 text-vess-grey-950">
            Alert History
          </h3>
          <p className="mt-1 text-[11px] text-vess-grey-500">
            Review past alerts and their resolution status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-medium capitalize transition-colors',
                statusFilter === s
                  ? 'bg-vess-primary-500 text-vess-grey-50'
                  : 'border border-vess-grey-200 bg-vess-grey-50 text-vess-grey-800 hover:bg-vess-grey-100',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="text-[11px] text-vess-grey-800">
            <tr className="border-b border-vess-grey-200">
              <th className="py-3 font-medium">Severity</th>
              <th className="py-3 font-medium">Alert</th>
              <th className="py-3 font-medium">Device</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Triggered</th>
              <th className="py-3 font-medium">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <AlertHistoryRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[12px] font-medium text-vess-grey-950">
              No alerts found
            </p>
            <p className="mt-1 text-[11px] text-vess-grey-500">
              No alerts match the selected filter.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

const statusChipClass: Record<AlertHistoryMock['status'], string> = {
  active: 'bg-vess-red-50 text-vess-red-500',
  acknowledged: 'bg-vess-secondary-50 text-vess-secondary-500',
  resolved: 'bg-vess-green-50 text-vess-green-800',
}

function AlertHistoryRow({ entry }: { entry: AlertHistoryMock }) {
  return (
    <tr className="border-b border-vess-grey-200/70">
      <td className="py-4">
        <span
          className={cn(
            'rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-[0.4px]',
            severityChip[entry.severity],
          )}
        >
          {severityLabel[entry.severity]}
        </span>
      </td>
      <td className="py-4">
        <div>
          <p className="font-medium text-vess-grey-950">{entry.title}</p>
          <p className="mt-0.5 text-[11px] text-vess-grey-500">{entry.body}</p>
        </div>
      </td>
      <td className="py-4">
        <span className="rounded-md bg-vess-grey-100 px-2 py-0.5 text-[11px] text-vess-grey-800">
          {entry.deviceName}
        </span>
      </td>
      <td className="py-4">
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[11px] font-medium capitalize',
            statusChipClass[entry.status],
          )}
        >
          {entry.status}
        </span>
      </td>
      <td className="py-4 text-[11px] text-vess-grey-800">{entry.triggeredAt}</td>
      <td className="py-4 text-[11px] text-vess-grey-800">
        {entry.resolvedAt ?? '—'}
      </td>
    </tr>
  )
}
