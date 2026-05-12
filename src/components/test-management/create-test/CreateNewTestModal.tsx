import { useState } from 'react'
import { CloseIcon } from '@/components/icons'
import { CreateTestStep1Form } from '@/components/test-management/create-test/CreateTestStep1Form'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CreateTestStep1Draft } from '@/types/create-test'

type CreateNewTestModalProps = {
  open: boolean
  onClose: () => void
  onContinue: (draft: CreateTestStep1Draft) => void
}

/** Renders only while the dialog is mounted; unmount resets local step-1 state. */
function CreateNewTestModalBody({ onContinue }: Pick<CreateNewTestModalProps, 'onContinue'>) {
  const [creationMethod, setCreationMethod] = useState<CreateTestStep1Draft['creationMethod'] | null>(null)
  const [testType, setTestType] = useState<CreateTestStep1Draft['testType']>(null)

  const canContinue =
    creationMethod !== null && (creationMethod === 'bulk' || (creationMethod === 'single' && testType !== null))

  function handleContinue() {
    if (!canContinue || creationMethod === null) return
    onContinue({ creationMethod, testType: creationMethod === 'bulk' ? null : testType })
  }

  return (
    <div className="relative">
      <DialogClose
        className="absolute right-5 top-0 inline-flex text-vess-grey-950 transition-opacity hover:opacity-70 focus:outline-none"
        aria-label="Close"
      >
        <CloseIcon className="size-6" />
      </DialogClose>

      <div className="flex flex-col gap-2 pr-8">
        <DialogTitle
          id="create-test-title"
          className="text-[25px] font-semibold leading-[30px] text-vess-grey-950"
        >
          Create New Test
        </DialogTitle>
        <DialogDescription className="text-[18px] font-normal leading-[21.6px] text-vess-grey-950">
          Step 1: Select how you want to create the test.
        </DialogDescription>
      </div>

      <div className="mt-8">
        <CreateTestStep1Form
          creationMethod={creationMethod}
          onCreationMethodChange={setCreationMethod}
          testType={testType}
          onTestTypeChange={setTestType}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <DialogClose asChild>
          <button
            type="button"
            className="inline-flex h-12 min-w-[116px] items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
          >
            Cancel
          </button>
        </DialogClose>
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export function CreateNewTestModal({ open, onClose, onContinue }: CreateNewTestModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className='max-w-3xl max-h-[calc(100vh-2rem)]'>
        {open ? <CreateNewTestModalBody onContinue={onContinue} /> : null}
      </DialogContent>
    </Dialog>
  )
}
