import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowBackIcon } from '@/components/icons'
import { DeviceConfigurationForm } from '@/components/device-management/DeviceConfigurationForm'
import { Topbar } from '@/components/layout/Topbar'
import { Form } from '@/components/ui/form'
import { formatDeviceCoordinatesDisplay } from '@/data/device-management'
import { useBrowserGeolocation } from '@/hooks/use-browser-geolocation'
import { deviceQueryKeys } from '@/lib/device-query-keys'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { mapRegisterFormToPayload } from '@/lib/map-device-configuration-form'
import {
  deviceConfigurationFormDefaultValues,
  deviceConfigurationFormSchema,
  type DeviceConfigurationFormValues,
} from '@/schemas/device/device-configuration-form.schema'
import { deviceService } from '@/services/device.service'
import { toast } from 'sonner'

export default function RegisterDevicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const geo = useBrowserGeolocation()

  const form = useForm<DeviceConfigurationFormValues>({
    resolver: zodResolver(deviceConfigurationFormSchema),
    defaultValues: deviceConfigurationFormDefaultValues,
    mode: 'onSubmit',
  })

  const detectedLocationPreview = useMemo(() => {
    if (geo.state.status !== 'success') return null
    return {
      headline: 'Detected location',
      city: 'Approximate GPS position',
      coordinates: formatDeviceCoordinatesDisplay(geo.state.latitude, geo.state.longitude),
    }
  }, [geo.state])

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

  const registerMutation = useMutation({
    mutationFn: async (input: {
      values: DeviceConfigurationFormValues
      latitude: number
      longitude: number
    }) => {
      const payload = mapRegisterFormToPayload(input.values, {
        latitude: input.latitude,
        longitude: input.longitude,
      })
      const { data } = await deviceService.registerDevice(payload)
      return data
    },
    onSuccess: (data) => {
      toast.success(resolveApiSuccessMessage(data, 'Device registered.'))
      void queryClient.invalidateQueries({ queryKey: deviceQueryKeys.all })
      navigate('/device-management')
    },
  })

  function goHub() {
    navigate('/device-management')
  }

  function onSubmit(values: DeviceConfigurationFormValues) {
    if (geo.state.status !== 'success') {
      toast.error(
        'Select "Use detected location" and allow GPS in your browser before registering.',
      )
      return
    }
    registerMutation.mutate({
      values,
      latitude: geo.state.latitude,
      longitude: geo.state.longitude,
    })
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Device fleet management" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5 md:px-5 md:py-6"
          >
            <div className="flex flex-col gap-8">
              <button
                type="button"
                onClick={goHub}
                className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
              >
                <ArrowBackIcon className="size-6" />
                <span className="text-[18px] font-light leading-[21.6px]">Back</span>
              </button>

              <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">
                Register New Device
              </h1>
            </div>

            <DeviceConfigurationForm
              detectedLocationPreview={detectedLocationPreview}
              geolocationControls={geolocationControls}
            />

            {registerMutation.isError && registerMutation.error ?
              <p
                className="text-[15px] font-normal leading-[18px] text-vess-red-500"
                role="alert"
              >
                {formatApiMutationError(registerMutation.error)}
              </p>
            : null}

            <div className="flex h-12 flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goHub}
                className="inline-flex h-full min-w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {registerMutation.isPending ? 'Registering…' : 'Complete registration'}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
