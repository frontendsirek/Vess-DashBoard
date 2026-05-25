import { ActiveTestsIcon, DeviceGreenIcon, FailedTestsIcon, SpeedometerIcon } from '@/components/icons'
import { DeviceStatusCard } from '@/components/dashboard/DeviceStatusCard'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { LiveNetworkMap } from '@/components/dashboard/LiveNetworkMap'
import { NetworkOverviewCard } from '@/components/dashboard/NetworkOverviewCard'
import { RecentAlertsCard } from '@/components/dashboard/RecentAlertsCard'
import { RunningTestsCard } from '@/components/dashboard/RunningTestsCard'
import { SuccessRateChart } from '@/components/dashboard/SuccessRateChart'

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Active Tests"
            value="30"
            icon={ActiveTestsIcon}
            iconBg="navy"
            delta={{ value: '12%', direction: 'up', tone: 'green' }}
          />
          <KpiCard
            label="Online Devices"
            value="4"
            suffix="of 5"
            icon={DeviceGreenIcon}
            iconBg="green"
            delta={{ value: '5%', direction: 'up', tone: 'green' }}
          />
          <KpiCard
            label="AVG. Network Speed"
            value={
              <>
                50 <span className="text-[18px] font-normal leading-[21.6px]">Mbps</span>
              </>
            }
            icon={SpeedometerIcon}
            iconBg="amber"
            delta={{ value: '2.3%', direction: 'up', tone: 'green' }}
          />
          <KpiCard
            label="Failed Tests"
            value="30"
            icon={FailedTestsIcon}
            iconBg="red"
            delta={{ value: '10%', direction: 'down', tone: 'red' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
          <SuccessRateChart />
          <RunningTestsCard />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DeviceStatusCard />
          <RecentAlertsCard />
        </div>

        <LiveNetworkMap />

        <NetworkOverviewCard />
      </div>
    </>
  )
}
