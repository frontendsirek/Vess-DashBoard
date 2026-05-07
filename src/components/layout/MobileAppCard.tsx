import { VessLogoMark2 } from '@/components/icons'

export function MobileAppCard() {
  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-2xl bg-vess-primary-400 px-4 py-5">
      <div className="flex size-[34px] items-center justify-center text-vess-secondary-500">
        <VessLogoMark2 className="size-full" />
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <p className="w-full text-[18px] font-medium leading-[21.6px] text-vess-grey-50">
          Download our Mobile App
        </p>
        <button
          type="button"
          className="flex h-[50px] w-full items-center justify-center rounded-full bg-vess-secondary-500 px-10 py-4 text-[15px] font-semibold leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
        >
          Download now
        </button>
      </div>
    </div>
  )
}
