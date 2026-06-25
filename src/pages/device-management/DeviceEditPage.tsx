import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowBackIcon } from '@/components/icons'
import { DeviceConfigurationForm } from '@/components/device-management/DeviceConfigurationForm'
import type { DeviceConfigurationDetectedLocation } from '@/components/device-management/DeviceConfigurationForm'
import { Form } from '@/components/ui/form'
import type { DeviceEditDefaults } from '@/data/device-management'
import { formatDeviceCoordinatesDisplay } from '@/data/device-management'
import { useBrowserGeolocation } from '@/hooks/use-browser-geolocation'
import { useDeviceDetailQuery } from '@/hooks/devices/use-device-detail-query'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import {
  deviceEditDefaultsToFormValues,
  mapDeviceConfigurationFormToUpdatePayload,
} from '@/lib/map-device-configuration-form'
import { deviceService } from '@/services/device.service'
import type { ApiDeviceDetail } from '@/types/device'
import {
  deviceConfigurationFormSchema,
  type DeviceConfigurationFormValues,
} from '@/schemas/device/device-configuration-form.schema'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

import {
  buildDeviceEditDefaultsFromApi,
  buildDeviceEditDetectedLocationFromApi,
} from './build-device-edit-page-model'

type DeviceEditConfiguredFormProps = {
  deviceId: string
  defaults: DeviceEditDefaults
  serverLocationPreview: DeviceConfigurationDetectedLocation
  subtitleFallback: string
  apiSnapshot: ApiDeviceDetail
}

function DeviceEditConfiguredForm({
  deviceId,
  defaults,
  serverLocationPreview,
  subtitleFallback,
  apiSnapshot,
}: DeviceEditConfiguredFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const geo = useBrowserGeolocation()

  const form = useForm<DeviceConfigurationFormValues>({
    resolver: zodResolver(deviceConfigurationFormSchema),
    defaultValues: deviceEditDefaultsToFormValues(defaults),
    mode: 'onSubmit',
  })

  const deviceNameWatch = useWatch({ control: form.control, name: 'deviceName' }) ?? ''
  const detailPath =
    `/device-management/${encodeURIComponent(deviceId.trim() ? deviceId : '')}`

  function goBack() {
    navigate(detailPath)
  }

  const detectedLocationPreview = useMemo(() => {
    if (geo.state.status === 'success') {
      return {
        headline: 'Current location',
        city: 'Approximate GPS position',
        coordinates: formatDeviceCoordinatesDisplay(geo.state.latitude, geo.state.longitude),
      }
    }
    return serverLocationPreview
  }, [geo.state, serverLocationPreview])

  const geolocationControls = useMemo(
    () => ({
      status: geo.state.status,
      errorMessage: geo.state.status === 'error' ? geo.state.message : undefined,
      latitude: geo.state.status === 'success' ? geo.state.latitude : null,
      longitude: geo.state.status === 'success' ? geo.state.longitude : null,
      onRequestPosition: geo.requestPosition,
    }),
    [geo.state, geo.requestPosition],
  )

  type UpdateDeviceMutationInput = {
    values: DeviceConfigurationFormValues
    latitude: number
    longitude: number
    location: string
  }

  const updateDeviceMutation = useMutation({
    mutationFn: async (input: UpdateDeviceMutationInput) => {
      if (!deviceId.trim()) throw new Error('Missing device.')
      const { data } = await deviceService.updateDevice(deviceId, {
        device_id: apiSnapshot.device_id,
        ...mapDeviceConfigurationFormToUpdatePayload(input.values, {
          latitude: input.latitude,
          longitude: input.longitude,
          location: input.location,
        }),
      })
      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Device updated.'))
      void queryClient.invalidateQueries({ queryKey: deviceQueryKeys.all })
    },
  })


  function onValidSubmit(values: DeviceConfigurationFormValues) {
    const latitude =
      geo.state.status === 'success' ? geo.state.latitude : apiSnapshot.latitude
    const longitude =
      geo.state.status === 'success' ? geo.state.longitude : apiSnapshot.longitude
    const browserOk = geo.state.status === 'success'
    const location =
      values.locationMode === 'manual' ? values.locationManual.trim()
      : browserOk ? formatDeviceCoordinatesDisplay(latitude, longitude)
      : apiSnapshot.location

    updateDeviceMutation.mutate(
      { values, latitude, longitude, location },
      {
        onSuccess: () => goBack(),
      },
    )
  }

  const subtitleName =
    deviceNameWatch.trim().length > 0 ? deviceNameWatch.trim() : subtitleFallback

  return (
    <>
      <div className="flex flex-col gap-4 px-5 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onValidSubmit)}
            className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5 md:px-5 md:py-6"
          >
            <div className="flex flex-col gap-8">
              <button
                type="button"
                onClick={goBack}
                className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
              >
                <ArrowBackIcon className="size-6" />
                <span className="text-[16px] font-light leading-[21.6px]">Back</span>
              </button>

              <header className="flex flex-col gap-1">
                <h1 className="text-[23px] font-semibold leading-[30px] text-vess-grey-950">
                  Edit Device Configuration
                </h1>
                <p className="text-[13px] font-light leading-[18px] text-vess-grey-950">{subtitleName}</p>
              </header>
            </div>

            <DeviceConfigurationForm
              mode="edit"
              detectedLocationPreview={detectedLocationPreview}
              geolocationControls={geolocationControls}
            />

            {updateDeviceMutation.isError && updateDeviceMutation.error ?
              <p
                className="text-[13px] font-normal leading-[18px] text-vess-red-500"
                role="alert"
              >
                {formatApiMutationError(updateDeviceMutation.error)}
              </p>
            : null}

            <div className="flex h-12 flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-full min-w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateDeviceMutation.isPending}
                className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updateDeviceMutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}

export default function DeviceEditPage() {
  const { deviceId = '' } = useParams()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const apiQueryEnabled = Boolean(accessToken?.length && deviceId.trim())
  const apiDeviceQuery = useDeviceDetailQuery(accessToken, deviceId, apiQueryEnabled)

  const apiSnapshot = apiDeviceQuery.data

  const formDefaults = useMemo((): DeviceEditDefaults | null => {
    if (!apiSnapshot) return null
    return buildDeviceEditDefaultsFromApi(apiSnapshot, deviceId)
  }, [apiSnapshot, deviceId])

  const detectedCard = useMemo(() => {
    if (!apiSnapshot) return null
    return buildDeviceEditDetectedLocationFromApi(apiSnapshot)
  }, [apiSnapshot])

  const formRemountKey = `${deviceId}:api:${apiDeviceQuery.dataUpdatedAt ?? 0}`

  const subtitleFallback = useMemo(() => {
    const name =
      typeof apiSnapshot?.device_name === 'string' ?
        apiSnapshot.device_name.trim()
      : ''
    return name.length > 0 ? name : (formDefaults?.name ?? '')
  }, [apiSnapshot, formDefaults])

  if (!deviceId.trim()) {
    return null
  }

  if (!accessToken?.length) {
    return (
      <>
        <div className="flex flex-col gap-4 px-5 py-6">
          <p className="text-center text-[13px] text-vess-grey-800">
            Sign in to edit this device.
          </p>
          <button
            type="button"
            onClick={() => navigate('/device-management')}
            className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[13px] font-medium text-vess-primary-500"
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
          <p className="text-center text-[13px] text-vess-grey-600">Loading device…</p>
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
          <p className="text-center text-[13px] text-vess-red-800">
            Could not load device. {errMsg}
          </p>
          <button
            type="button"
            onClick={() => navigate('/device-management')}
            className="mx-auto w-fit rounded-lg border border-vess-primary-500 bg-vess-grey-50 px-4 py-3 text-[13px] font-medium text-vess-primary-500"
          >
            Back to devices
          </button>
        </div>
      </>
    )
  }

  if (!apiSnapshot || !formDefaults || !detectedCard) {
    return null
  }

  return (
    <DeviceEditConfiguredForm
      key={formRemountKey}
      deviceId={deviceId}
      defaults={formDefaults}
      serverLocationPreview={detectedCard}
      subtitleFallback={subtitleFallback}
      apiSnapshot={apiSnapshot}
    />
  )
}
