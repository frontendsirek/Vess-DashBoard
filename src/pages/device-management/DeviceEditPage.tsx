import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowBackIcon } from '@/components/icons'
import { DeviceConfigurationForm } from '@/components/device-management/DeviceConfigurationForm'
import { Topbar } from '@/components/layout/Topbar'
import type { PhoneInputValue } from '@/components/ui/phone-input'
import {
  deviceEditDefaults,
  deviceEditDetectedLocation,
  resolveDeviceRecord,
} from '@/data/device-management'

export default function DeviceEditPage() {
  const { deviceId = '' } = useParams()
  const navigate = useNavigate()
  const device = useMemo(() => resolveDeviceRecord(deviceId), [deviceId])
  const defaults = useMemo(() => deviceEditDefaults(deviceId), [deviceId])
  const detectedCard = useMemo(() => (device ? deviceEditDetectedLocation(device) : null), [device])

  const [name, setName] = useState(defaults.name)
  const [locationMode, setLocationMode] = useState(defaults.locationMode)
  const [locationManual, setLocationManual] = useState(defaults.locationManual)
  const [deviceGroup, setDeviceGroup] = useState(defaults.deviceGroup)
  const [msisdn, setMsisdn] = useState<PhoneInputValue | undefined>(
    defaults.msisdn ? (defaults.msisdn as PhoneInputValue) : undefined,
  )
  const [tags, setTags] = useState(defaults.tags)
  const [lowBatteryPercent, setLowBatteryPercent] = useState(defaults.lowBatteryPercent)
  const [offlineMinutes, setOfflineMinutes] = useState(defaults.offlineMinutes)

  useEffect(() => {
    setName(defaults.name)
    setLocationMode(defaults.locationMode)
    setLocationManual(defaults.locationManual)
    setDeviceGroup(defaults.deviceGroup)
    setMsisdn(defaults.msisdn ? (defaults.msisdn as PhoneInputValue) : undefined)
    setTags(defaults.tags)
    setLowBatteryPercent(defaults.lowBatteryPercent)
    setOfflineMinutes(defaults.offlineMinutes)
  }, [defaults])

  useEffect(() => {
    if (!device) navigate('/device-management', { replace: true })
  }, [device, navigate])

  if (!device || !detectedCard) return null

  const canSubmit = name.trim().length > 0
  const detailPath = `/device-management/${deviceId}`

  function goBack() {
    navigate(detailPath)
  }

  function handleSave() {
    if (!canSubmit) return
    goBack()
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Device fleet management" />
      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5 md:px-5 md:py-6">
          <div className="flex flex-col gap-8">
            <button
              type="button"
              onClick={goBack}
              className="flex w-fit items-center gap-4 text-vess-grey-950 transition-opacity hover:opacity-80"
            >
              <ArrowBackIcon className="size-6" />
              <span className="text-[18px] font-light leading-[21.6px]">Back</span>
            </button>

            <header className="flex flex-col gap-1">
              <h1 className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">
                Edit Device Configuration
              </h1>
              <p className="text-[15px] font-light leading-[18px] text-vess-grey-950">
                {name.trim() || device.name}
              </p>
            </header>
          </div>

          <DeviceConfigurationForm
            deviceName={name}
            onDeviceNameChange={setName}
            locationMode={locationMode}
            onLocationModeChange={setLocationMode}
            detectedLocation={detectedCard}
            locationManual={locationManual}
            onLocationManualChange={setLocationManual}
            deviceGroup={deviceGroup}
            onDeviceGroupChange={setDeviceGroup}
            msisdn={msisdn}
            onMsisdnChange={setMsisdn}
            tags={tags}
            onTagsChange={setTags}
            lowBatteryPercent={lowBatteryPercent}
            onLowBatteryPercentChange={setLowBatteryPercent}
            offlineMinutes={offlineMinutes}
            onOfflineMinutesChange={setOfflineMinutes}
          />

          <div className="flex h-12 flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-full min-w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSave}
              className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
