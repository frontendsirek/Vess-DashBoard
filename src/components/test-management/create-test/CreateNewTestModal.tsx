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

  const canContinue = creationMethod !== null && testType !== null

  function handleContinue() {
    if (!canContinue || creationMethod === null || testType === null) return
    onContinue({ creationMethod, testType })
  }

  return (
    <div className="relative flex flex-col gap-10">
      <div className="flex items-start justify-between gap-4 pr-1">
        <div className="flex min-w-0 flex-col gap-1.5">
          <DialogTitle
            id="create-test-title"
            className="text-[25px] font-semibold leading-[30px] text-vess-grey-950"
          >
            Create New Test
          </DialogTitle>
          <DialogDescription className="text-[15px] font-light leading-[18px] text-vess-grey-950">
            Step 1: Select how you want to create the test.
          </DialogDescription>
        </div>
        <DialogClose
          className="inline-flex shrink-0 text-vess-grey-950 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <CloseIcon className="size-6" />
        </DialogClose>
      </div>

      <CreateTestStep1Form
        creationMethod={creationMethod}
        onCreationMethodChange={setCreationMethod}
        testType={testType}
        onTestTypeChange={setTestType}
      />

      <div className="flex h-12 flex-wrap items-center justify-between gap-3">
        <DialogClose asChild>
          <button
            type="button"
            className="inline-flex h-full items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
          >
            Cancel
          </button>
        </DialogClose>
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
      <DialogContent
        overlayClassName="bg-black/[0.12] backdrop-blur-[4px]"
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[675px] gap-0 overflow-y-auto rounded-2xl border-0 bg-vess-grey-50 px-6 py-8 shadow-xl sm:w-full"
      >
        {open ? <CreateNewTestModalBody onContinue={onContinue} /> : null}
      </DialogContent>
    </Dialog>
  )
}
