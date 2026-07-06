import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CloseIcon } from '@/components/icons'
import { CreateTestStep1Form } from '@/components/test-management/create-test/CreateTestStep1Form'
import { Form } from '@/components/ui/form'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBulkCsvImportMutation } from '@/hooks/tests/use-bulk-csv-import-mutation'
import {
  step1DefaultValues,
  step1FormSchema,
  toStep1Draft,
  type Step1FormValues,
} from '@/schemas/create-test/step1.schema'
import type { CreateTestStep1Draft } from '@/types/create-test'
import type { BulkCsvImportData } from '@/types/test'

type CreateNewTestModalProps = {
  open: boolean
  onClose: () => void
  onContinue: (draft: CreateTestStep1Draft) => void
}

/** Renders only while the dialog is mounted; unmount resets local step-1 state. */
function CreateNewTestModalBody({
  onContinue,
  onClose,
}: Pick<CreateNewTestModalProps, 'onContinue' | 'onClose'>) {
  const bulkCsvMutation = useBulkCsvImportMutation()
  const [bulkRowFailures, setBulkRowFailures] = useState<BulkCsvImportData | null>(null)

  const form = useForm<Step1FormValues>({
    resolver: zodResolver(step1FormSchema),
    defaultValues: step1DefaultValues,
    mode: 'onSubmit',
  })

  async function onSubmit(values: Step1FormValues) {
    if (values.creationMethod === 'bulk') {
      setBulkRowFailures(null)
      bulkCsvMutation.reset()
      try {
        const response = await bulkCsvMutation.mutateAsync(values.bulkCsvFile!)
        const { successCount, failureCount } = response.data
        if (successCount === 0 && failureCount > 0) {
          setBulkRowFailures(response.data)
          return
        }
        onClose()
      } catch {
        /* mutation error surfaced below */
      }
      return
    }
    onContinue(toStep1Draft(values))
  }

  const bulkMutationError =
    bulkCsvMutation.error instanceof Error ? bulkCsvMutation.error.message : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex flex-col gap-10" noValidate>
        <div className="flex items-start justify-between gap-4 pr-1">
          <div className="flex min-w-0 flex-col gap-1.5">
            <DialogTitle
              id="create-test-title"
              className="text-[23px] font-semibold leading-[30px] text-vess-grey-950"
            >
              Create New Test
            </DialogTitle>
            <DialogDescription className="text-[13px] font-light leading-[18px] text-vess-grey-950">
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

        <CreateTestStep1Form />

        {(bulkMutationError || bulkRowFailures) && (
          <div className="flex flex-col gap-2 rounded-xl border border-vess-red-200 bg-vess-red-50 px-4 py-3 text-[13px] text-vess-red-800">
            {bulkMutationError ? <p>{bulkMutationError}</p> : null}
            {bulkRowFailures ?
              <>
                <p>
                  Could not import any rows ({bulkRowFailures.failureCount}{' '}
                  {bulkRowFailures.failureCount === 1 ? 'failure' : 'failures'}).
                </p>
                {bulkRowFailures.errors.length > 0 ?
                  <ul className="max-h-40 list-inside list-disc overflow-y-auto text-[12px]">
                    {bulkRowFailures.errors.map((row, index) => (
                      <li key={`${row.rowNumber}-${index}-${row.error}`}>
                        Row {row.rowNumber}: {row.error}
                      </li>
                    ))}
                  </ul>
                : null}
              </>
            : null}
          </div>
        )}

        <div className="flex h-12 flex-wrap items-center justify-between gap-3">
          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex h-full items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-950 transition-colors hover:bg-vess-grey-100"
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type="submit"
            disabled={form.formState.isSubmitting || bulkCsvMutation.isPending}
            className="inline-flex h-full items-center justify-center rounded-lg bg-vess-primary-500 px-6 text-[13px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </form>
    </Form>
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
        {open ? <CreateNewTestModalBody onContinue={onContinue} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  )
}
