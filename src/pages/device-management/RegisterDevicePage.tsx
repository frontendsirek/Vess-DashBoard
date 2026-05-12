import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowBackIcon } from '@/components/icons'
import { Topbar } from '@/components/layout/Topbar'
import {
  DeviceConfigurationForm,
} from '@/components/device-management/DeviceConfigurationForm'
import type { PhoneInputValue } from '@/components/ui/phone-input'
import { registerDeviceDetectedLocation } from '@/data/device-management'

const DEFAULT_REGISTER_MSISDN = '+2348012345678' as PhoneInputValue

export default function RegisterDevicePage() {
  const navigate = useNavigate()

  const [deviceName, setDeviceName] = useState('Lagos-Central-01')
  const [locationMode, setLocationMode] = useState<'detected' | 'manual'>('detected')
  const [locationManual, setLocationManual] = useState('')
  const [deviceGroup, setDeviceGroup] = useState('')
  const [msisdn, setMsisdn] = useState<PhoneInputValue | undefined>(DEFAULT_REGISTER_MSISDN)
  const [tags, setTags] = useState('lagos, tier-1, priority')
  const [lowBatteryPercent, setLowBatteryPercent] = useState(15)
  const [offlineMinutes, setOfflineMinutes] = useState(10)

  const canSubmit = deviceName.trim().length > 0

  function goHub() {
    navigate('/device-management')
  }

  function handleComplete() {
    if (!canSubmit) return
    goHub()
  }

  return (
    <>
      <Topbar title="Device Management" subtitle="Device fleet management" />

      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="flex flex-col gap-8 rounded-2xl bg-vess-grey-50 px-4 py-5 md:px-5 md:py-6">
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
            deviceName={deviceName}
            onDeviceNameChange={setDeviceName}
            locationMode={locationMode}
            onLocationModeChange={setLocationMode}
            detectedLocation={registerDeviceDetectedLocation}
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
              onClick={goHub}
              className="inline-flex h-full min-w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleComplete}
              className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Complete registration
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
