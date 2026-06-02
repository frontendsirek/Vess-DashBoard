import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DeviceStatusBadge } from '@/components/device-management/DeviceStatusBadge'
import { DeviceDiagnosticsModal } from '@/components/device-management/DeviceDiagnosticsModal'
import { DeregisterDeviceModal } from '@/components/device-management/DeregisterDeviceModal'
import {
  ArrowBackIcon,
  EditOutlineIcon,
  HardwareChipOutlineIcon,
  HealthMetricsIcon,
  LocationPinIcon,
  RemoteDeviceIcon,
  SignalBarsIcon,
} from '@/components/icons'
import { useDeregisterDeviceMutation } from '@/hooks/devices/use-deregister-device-mutation'
import { useExportDeviceDataMutation } from '@/hooks/devices/use-export-device-data-mutation'
import { useRunDeviceDiagnosticsMutation } from '@/hooks/devices/use-run-device-diagnostics-mutation'
import { useDeviceDetailQuery } from '@/hooks/devices/use-device-detail-query'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiDeviceDiagnosticsResult } from '@/types/device'

import {
  MISSING_API_FIELD_DISPLAY,
  buildDeviceManagementDetailPageModel,
} from './build-device-detail-page-model'

/** When coordinates are absent, embedding an empty doc avoids bogus network requests from `-`. */
const MAP_EMBED_FALLBACK = 'about:blank'

export default function DeviceDetailPage() {
  const { deviceId = '' } = useParams()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const apiDeviceQuery = useDeviceDetailQuery(
    accessToken,
    deviceId,
    Boolean(deviceId && accessToken),
  )

  const deregisterMutation = useDeregisterDeviceMutation(accessToken, deviceId)
  const exportDeviceDataMutation = useExportDeviceDataMutation(accessToken)
  const diagnosticsMutation = useRunDeviceDiagnosticsMutation(accessToken, deviceId)
  const [deregisterModalOpen, setDeregisterModalOpen] = useState(false)
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false)
  const [diagnosticsResult, setDiagnosticsResult] = useState<ApiDeviceDiagnosticsResult | null>(
    null,
  )

  const apiDevice = apiDeviceQuery.data ?? null
  const model = useMemo(
    () => (apiDevice ? buildDeviceManagementDetailPageModel(apiDevice) : null),
    [apiDevice],
  )

  useEffect(() => {
    if (!deviceId) {
      navigate('/device-management', { replace: true })
    }
  }, [deviceId, navigate])

  if (!deviceId) {
    return null
  }

  if (!accessToken) {
    return (
      <>
        <div className="flex flex-col gap-4 px-5 py-6">
          <p className="text-center text-[15px] text-vess-grey-800">
            Sign in to load this device from the API.
          </p>
          <button
            type="button"
            onClick={() => navigate('/device-management')}
            className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium text-vess-primary-500"
          >
            Back to devices
          </button>
        </div>
      </>
    )
  }

  if (apiDeviceQuery.isPending) {
    return (
      <>
        <div className="px-5 py-6">
          <p className="text-center text-[15px] text-vess-grey-600">Loading device…</p>
        </div>
      </>
    )
  }

  if (apiDeviceQuery.isError) {
    const errMsg =
      apiDeviceQuery.error instanceof Error ? apiDeviceQuery.error.message : 'Request failed.'
    return (
      <>
        <div className="flex flex-col gap-4 px-5 py-6">
          <p className="text-center text-[15px] text-vess-red-800">
            Could not load this device from the API. {errMsg}
          </p>
          <button
            type="button"
            onClick={() => navigate('/device-management')}
            className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium text-vess-primary-500"
          >
            Back to devices
          </button>
        </div>
      </>
    )
  }

  if (!apiDevice || !model) {
    return null
  }

  const routeId = model.routeDeviceId

  const goRemote = () => {
    navigate(`/remote-device-control?deviceId=${encodeURIComponent(routeId)}`, {
      state: { deviceId: routeId },
    })
  }

  function handleExportDeviceData() {
    exportDeviceDataMutation.mutate({ deviceId: routeId })
  }

  function handleRunDiagnostics() {
    setDiagnosticsModalOpen(true)
    setDiagnosticsResult(null)
    diagnosticsMutation.mutate(undefined, {
      onSuccess: (result) => {
        setDiagnosticsResult(result)
      },
    })
  }

  const mapIframeSrc = model.location.mapEmbedSrc ?? MAP_EMBED_FALLBACK

  return (
    <>
      <div className="px-5 py-6">
        <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-100 px-4 py-6 md:px-5">
          <button
            type="button"
            onClick={() => navigate('/device-management')}
            className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
          >
            <ArrowBackIcon className="size-6" />
            <span className="text-[18px] font-light leading-[21.6px]">Back</span>
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3">
              <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">{model.displayName}</h1>
              <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">{model.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => navigate(`/device-management/${encodeURIComponent(routeId)}/edit`)}
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
              >
                <EditOutlineIcon className="size-6 shrink-0 text-vess-primary-500" />
                Edit
              </button>
              <button
                type="button"
                onClick={goRemote}
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-vess-primary-500 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
              >
                <RemoteDeviceIcon className="size-6 shrink-0 text-vess-grey-50" />
                Remote control
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-vess-grey-50 px-4 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">Status</span>
                <DeviceStatusBadge status={model.managementStatus} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[18px] leading-[21.6px] text-vess-grey-950">
                <span className="font-light">Last seen</span>
                <span className="font-medium">{model.lastSeen}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              <DetailSectionCard
                icon={HardwareChipOutlineIcon}
                title="Hardware Information"
              >
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DetailField label="Model" value={model.hardware.model} />
                    <DetailField label="Android" value={model.hardware.android} />
                  </div>
                  <DetailField label="App version" value={model.hardware.appVersion} />
                </div>
              </DetailSectionCard>

              <DetailSectionCard icon={HealthMetricsIcon} title="Health Metrics">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4 text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                      <span>Battery</span>
                      <span>{model.health.batteryCaption}</span>
                    </div>
                    <MetricProgressBar percent={model.health.batteryPercent} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4 text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                      <span>Storage</span>
                      <span>{model.health.storageCaption}</span>
                    </div>
                    <MetricProgressBar percent={model.health.storagePercent} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4 text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                      <span>Memory</span>
                      <span>{model.health.memoryCaption}</span>
                    </div>
                    <MetricProgressBar percent={model.health.memoryPercent} />
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[18px] font-light leading-[21.6px] text-vess-grey-950">
                    <span>Signal</span>
                    <span>{model.health.signalCaption}</span>
                  </div>
                </div>
              </DetailSectionCard>

              <DetailSectionCard icon={SignalBarsIcon} title="Network Information">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DetailField label="Operator" value={model.network.operator} />
                    <DetailField label="Network Type" value={model.network.networkType} />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
                    <DetailField label="MSISDN" value={model.network.msisdnDisplay} />
                    <div className="flex flex-col gap-2">
                      <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">Status</span>
                      <DeviceStatusBadge status={model.managementStatus} />
                    </div>
                  </div>
                </div>
              </DetailSectionCard>

              <DetailSectionCard icon={LocationPinIcon} title="Location">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DetailField label="Coordinates" value={model.location.coordinates} />
                    <DetailField label="Address" value={model.location.address} />
                  </div>
                  <div className="h-[247px] overflow-hidden rounded-lg bg-vess-grey-100">
                    <iframe
                      title={`Map for ${model.displayName}`}
                      src={mapIframeSrc}
                      className="size-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </DetailSectionCard>
            </div>

            <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-[354px]">
              <SidebarCard>
                <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Recent Tests (24h)</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 text-[18px]">
                    <div className="flex flex-col gap-2 text-vess-grey-950">
                      <span className="font-light leading-[21.6px]">Total</span>
                      <span className="font-medium leading-[21.6px]">{model.tests24h.totalDisplay}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-light leading-[21.6px] text-vess-grey-950">Success Rate</span>
                      <span className="font-medium leading-[21.6px] text-vess-green-500">
                        {model.tests24h.successRateDisplay}
                      </span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-vess-grey-200" />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[18px] font-light text-vess-grey-950">
                      <span>Successful</span>
                      <span className="flex min-w-[30px] justify-center rounded-lg bg-vess-green-50 px-1 py-1 text-[18px] font-medium text-vess-green-500">
                        {model.tests24h.successfulDisplay}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[18px] font-light text-vess-grey-950">
                      <span>Failed</span>
                      <span className="flex min-w-[30px] justify-center rounded-lg bg-vess-red-50 px-1 py-1 text-[18px] font-medium text-vess-red-500">
                        {model.tests24h.failedDisplay}
                      </span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-vess-grey-200" />
                  <div className="flex flex-col gap-2 text-[18px] text-vess-grey-950">
                    <span className="font-light leading-[21.6px]">Last test</span>
                    <span className="font-medium leading-[21.6px]">{model.tests24h.lastTestDisplay}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/device-management/${encodeURIComponent(routeId)}/test-history`)}
                  className="flex h-[50px] w-full items-center justify-center rounded-lg border border-vess-primary-500 bg-vess-grey-50 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
                >
                  View full test history
                </button>
              </SidebarCard>

              <SidebarCard>
                <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Device Info</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">Group</span>
                    <span className="inline-flex w-fit rounded-lg bg-vess-grey-100 px-2 py-1 text-[13px] font-normal leading-[15.6px] text-vess-grey-500">
                      {model.sidebar.group}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {model.sidebar.tags.length === 0 ? (
                        <span className="text-[13px] text-vess-grey-500">{MISSING_API_FIELD_DISPLAY}</span>
                      ) : (
                        model.sidebar.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-lg bg-vess-grey-100 px-2 py-1 text-[13px] font-normal leading-[15.6px] text-vess-grey-500"
                          >
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </SidebarCard>

              <SidebarCard>
                <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">Quick Actions</h2>
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/device-management/${encodeURIComponent(routeId)}/logs`)}
                    className="flex h-[50px] w-full items-center justify-center rounded-lg border border-vess-primary-500 bg-vess-grey-50 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100"
                  >
                    View device logs
                  </button>
                  <button
                    type="button"
                    disabled={exportDeviceDataMutation.isPending}
                    onClick={handleExportDeviceData}
                    className="flex h-[50px] w-full items-center justify-center rounded-lg border border-vess-primary-500 bg-vess-grey-50 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {exportDeviceDataMutation.isPending ? 'Exporting…' : 'Export device data'}
                  </button>
                  <button
                    type="button"
                    disabled={diagnosticsMutation.isPending}
                    onClick={handleRunDiagnostics}
                    className="flex h-[50px] w-full items-center justify-center rounded-lg border border-vess-primary-500 bg-vess-grey-50 text-[15px] font-medium leading-[18px] text-vess-primary-500 transition-colors hover:bg-vess-grey-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {diagnosticsMutation.isPending ? 'Running…' : 'Run diagnostics'}
                  </button>
                  <button
                    type="button"
                    disabled={deregisterMutation.isPending}
                    onClick={() => setDeregisterModalOpen(true)}
                    className="flex h-[50px] w-full items-center justify-center rounded-lg bg-vess-red-500 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Unregister device
                  </button>
                </div>
              </SidebarCard>
            </aside>
          </div>
        </div>
      </div>

      <DeregisterDeviceModal
        open={deregisterModalOpen}
        onClose={() => setDeregisterModalOpen(false)}
        deviceName={model?.displayName ?? deviceId}
        isPending={deregisterMutation.isPending}
        onConfirm={(reason) => deregisterMutation.mutate(reason)}
      />

      <DeviceDiagnosticsModal
        open={diagnosticsModalOpen}
        onClose={() => setDiagnosticsModalOpen(false)}
        deviceName={model.displayName}
        result={diagnosticsResult}
        isPending={diagnosticsMutation.isPending}
      />
    </>
  )
}

function DetailSectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-vess-grey-200 bg-vess-grey-50 px-4 py-5">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Icon className="size-6 shrink-0 text-vess-grey-950" />
          <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  )
}

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-lg bg-vess-grey-50 px-4 py-5">{children}</section>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[18px] font-light leading-[21.6px] text-vess-grey-950">{label}</span>
      <span className="text-[18px] font-medium leading-[21.6px] text-vess-grey-950">{value}</span>
    </div>
  )
}

function MetricProgressBar({ percent }: { percent: number }) {
  const width = `${Math.min(100, Math.max(0, percent))}%`
  return (
    <div className="h-[7px] w-full overflow-hidden rounded bg-vess-grey-100">
      <div className="h-full rounded bg-vess-primary-500" style={{ width }} />
    </div>
  )
}
