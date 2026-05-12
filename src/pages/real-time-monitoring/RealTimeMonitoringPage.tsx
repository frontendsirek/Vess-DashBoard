import { Topbar } from '@/components/layout/Topbar'
import { ActiveTestExecutionCard } from '@/components/real-time-monitoring/ActiveTestExecutionCard'
import { DeviceStatusGrid } from '@/components/real-time-monitoring/DeviceStatusGrid'
import { LiveAlertFeed } from '@/components/real-time-monitoring/LiveAlertFeed'
import { MonitoringSummaryStrip } from '@/components/real-time-monitoring/MonitoringSummaryStrip'
import { NetworkHeatmapCard } from '@/components/real-time-monitoring/NetworkHeatmapCard'
import { PerformanceTrendsChart } from '@/components/real-time-monitoring/PerformanceTrendsChart'
import { activeExecutions } from '@/data/real-time-monitoring'

export default function RealTimeMonitoringPage() {
  return (
    <>
      <Topbar title="Real-time Monitoring" subtitle="Active test execution" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <MonitoringSummaryStrip />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
          <ActiveTestExecutionCard rows={activeExecutions} />
          <NetworkHeatmapCard />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
          <LiveAlertFeed />
          <DeviceStatusGrid />
        </div>

        <PerformanceTrendsChart />
      </div>
    </>
  )
}
