import { useState } from 'react'
import { CloseIcon } from '@/components/icons'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { deregisterDeviceSchema } from '@/schemas/device/deregister-device.schema'

type DeregisterDeviceModalProps = {
  open: boolean
  onClose: () => void
  deviceName: string
  isPending: boolean
  onConfirm: (reason: string) => void
}

function DeregisterDeviceModalBody({
  deviceName,
  isPending,
  onConfirm,
}: Pick<DeregisterDeviceModalProps, 'deviceName' | 'isPending' | 'onConfirm'>) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = deregisterDeviceSchema.safeParse({ reason })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid reason.')
      return
    }
    setError(null)
    onConfirm(parsed.data.reason)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-8" noValidate>
      <div className="flex items-start justify-between gap-4 pr-1">
        <div className="flex min-w-0 flex-col gap-1.5">
          <DialogTitle className="text-[25px] font-semibold leading-[30px] text-vess-grey-950">
            Unregister device
          </DialogTitle>
          <DialogDescription className="text-[15px] font-light leading-[18px] text-vess-grey-950">
            This will soft-deregister{' '}
            <span className="font-medium">{deviceName || 'this device'}</span>. The device will be
            marked inactive and removed from the active fleet.
          </DialogDescription>
        </div>
        <DialogClose
          className="inline-flex shrink-0 text-vess-grey-950 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <CloseIcon className="size-6" />
        </DialogClose>
      </div>

      <div className="flex flex-col gap-3">
        <label
          htmlFor="deregister-reason"
          className="flex items-center gap-1 text-[18px] leading-[21.6px] text-vess-grey-950"
        >
          Reason
          <span className="text-vess-red-500">*</span>
        </label>
        <div className="min-h-[127px] rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 p-4">
          <textarea
            id="deregister-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Device decommissioned"
            rows={4}
            disabled={isPending}
            className="w-full resize-none bg-transparent text-[15px] leading-[18px] text-vess-grey-950 placeholder:text-vess-grey-950 placeholder:opacity-20 outline-none disabled:opacity-50"
          />
        </div>
        {error ? (
          <p className="text-[13px] text-vess-red-800" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex h-12 flex-wrap items-center justify-between gap-3">
        <DialogClose asChild>
          <button
            type="button"
            disabled={isPending}
            className="inline-flex h-full items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </DialogClose>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-full items-center justify-center rounded-lg bg-vess-red-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Unregistering…' : 'Unregister device'}
        </button>
      </div>
    </form>
  )
}

export function DeregisterDeviceModal({
  open,
  onClose,
  deviceName,
  isPending,
  onConfirm,
}: DeregisterDeviceModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isPending) onClose()
      }}
    >
      <DialogContent
        overlayClassName="bg-black/[0.12] backdrop-blur-[4px]"
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[560px] gap-0 overflow-y-auto rounded-2xl border-0 bg-vess-grey-50 px-6 py-8 shadow-xl sm:w-full"
      >
        {open ? (
          <DeregisterDeviceModalBody
            deviceName={deviceName}
            isPending={isPending}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
