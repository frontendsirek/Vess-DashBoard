import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { CallIcon, CsvFileOutlineIcon, DataIcon, ExportDownloadIcon, SmsIcon } from '@/components/icons'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { triggerBlobDownload } from '@/lib/download-blob'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'
import { cn } from '@/lib/utils'
import { testService } from '@/services/test.service'
import type { Step1FormValues } from '@/schemas/create-test/step1.schema'
import { toast } from 'sonner'

const formMessageClassName = 'text-[13px] font-normal leading-[16px] text-vess-red-500'

const testTypes = [
  {
    type: 'Call' as const,
    title: 'Call Test',
    description: 'Measures call success rate and quality',
    icon: CallIcon,
    iconBg: 'bg-vess-primary-50',
    iconColor: 'text-vess-primary-500',
  },
  {
    type: 'SMS' as const,
    title: 'SMS Test',
    description: 'Measures message delivery rate',
    icon: SmsIcon,
    iconBg: 'bg-vess-secondary-50',
    iconColor: 'text-vess-secondary-500',
  },
  {
    type: 'Data' as const,
    title: 'Data Test',
    description: 'Measures network speed & latency',
    icon: DataIcon,
    iconBg: 'bg-vess-green-50',
    iconColor: 'text-vess-green-500',
  },
]

export function CreateTestStep1Form() {
  const form = useFormContext<Step1FormValues>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [templateDownloading, setTemplateDownloading] = useState(false)
  const [templateDownloadError, setTemplateDownloadError] = useState<string | null>(null)
  const creationMethod = useWatch({ control: form.control, name: 'creationMethod' })

  useEffect(() => {
    if (creationMethod === 'single' && fileInputRef.current) {
      fileInputRef.current.value = ''
      form.setValue('bulkCsvFile', undefined)
      form.clearErrors('bulkCsvFile')
    }
    if (creationMethod === 'bulk') {
      form.setValue('testType', null)
      form.clearErrors('testType')
    }
  }, [creationMethod, form])

  const assignCsvFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
      form.setValue('bulkCsvFile', file)
      form.clearErrors('bulkCsvFile')
    },
    [form],
  )

  async function downloadTemplate() {
    setTemplateDownloadError(null)
    setTemplateDownloading(true)
    try {
      const { blob, filename } = await testService.downloadBulkTestsTemplate()
      triggerBlobDownload(blob, filename)
      toast.success('Template downloaded.')
    } catch (err) {
      const msg = formatApiMutationError(err, {
        fallback: 'Could not download template. Sign in and try again.',
      })
      setTemplateDownloadError(msg)
      toast.error(msg)
    } finally {
      setTemplateDownloading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <FormField
        control={form.control}
        name="creationMethod"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-4 space-y-0">
            <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px] text-vess-grey-950">
              <span>Select Creation Method</span>
              <span className="text-vess-red-500">*</span>
            </div>
            <FormControl>
              <div className="flex flex-wrap gap-8">
                <RadioChoice
                  selected={field.value === 'single'}
                  onSelect={() => field.onChange('single')}
                  label="Single Creation"
                  name="creation"
                />
                <RadioChoice
                  selected={field.value === 'bulk'}
                  onSelect={() => field.onChange('bulk')}
                  label="Bulk Upload"
                  name="creation"
                />
              </div>
            </FormControl>
            <FormMessage className={formMessageClassName} />
          </FormItem>
        )}
      />

      {creationMethod === 'bulk' && (
        <div className="flex w-full max-w-[627px] flex-col gap-6">
          <FormField
            control={form.control}
            name="bulkCsvFile"
            render={() => (
              <FormItem className="space-y-0">
                <FormMessage className={formMessageClassName} />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-3">
            <p className="text-[18px] font-normal leading-[21.6px] text-vess-grey-950">Bulk Upload</p>
            <input
              ref={fileInputRef}
              id="bulk-csv-input"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Upload CSV file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                assignCsvFile(file)
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files?.[0]
                assignCsvFile(file)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex h-[192px] cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed border-vess-grey-100 bg-vess-grey-50 p-4 transition-colors',
                isDragging && 'border-vess-primary-500 bg-vess-primary-50/30',
              )}
            >
              <div className="flex size-[61px] items-center justify-center rounded-full bg-vess-grey-100">
                <CsvFileOutlineIcon className="size-[33px] text-vess-grey-800" />
              </div>
              <p className="text-center text-[15px] leading-[18px]">
                <span className="text-vess-primary-500 underline decoration-solid">Upload a CSV file</span>
                <span className="text-vess-grey-500"> or drag and drop</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px min-w-0 flex-1 bg-vess-grey-200" aria-hidden />
            <span className="shrink-0 text-[15px] font-normal leading-[18px] text-vess-grey-950">or</span>
            <div className="h-px min-w-0 flex-1 bg-vess-grey-200" aria-hidden />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[18px] font-normal leading-[21.6px] text-vess-grey-950">Download Template</p>
            <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-[33px] shrink-0 items-center justify-center">
                  <CsvFileOutlineIcon className="size-8 text-vess-primary-500" />
                </div>
                <span className="truncate text-[15px] font-normal leading-[18px] text-vess-grey-950">
                  template.csv
                </span>
              </div>
              <button
                type="button"
                disabled={templateDownloading}
                onClick={(e) => {
                  e.stopPropagation()
                  void downloadTemplate()
                }}
                className="inline-flex shrink-0 text-vess-primary-500 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Download template.csv"
              >
                <ExportDownloadIcon className="size-[19px]" />
              </button>
            </div>
          </div>
          {templateDownloadError ?
            <p className="text-[13px] font-normal leading-[16px] text-vess-red-500">{templateDownloadError}</p>
          : null}
        </div>
      )}

      {creationMethod === 'single' && (
        <FormField
          control={form.control}
          name="testType"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-4 space-y-0">
              <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px] text-vess-grey-950">
                <span>Select Test Type</span>
                <span className="text-vess-red-500">*</span>
              </div>
              <FormControl>
                <div className="flex flex-col gap-5 sm:flex-row">
                  {testTypes.map(({ type, title, description, icon: Icon, iconBg, iconColor }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={cn(
                        'flex w-full flex-1 flex-col items-center gap-6 rounded-2xl border-2 bg-vess-grey-50 px-4 py-5 text-left transition-colors',
                        field.value === type ? 'border-vess-primary-500' : 'border-vess-grey-100',
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-10 items-center justify-center rounded-full',
                          iconBg,
                          iconColor,
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex w-full flex-col items-center gap-3">
                        <p className="text-[18px] font-medium leading-[21.6px] text-vess-grey-950">{title}</p>
                        <p className="text-center text-[15px] font-light leading-[18px] text-vess-grey-950">
                          {description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage className={formMessageClassName} />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

function RadioChoice({
  selected,
  onSelect,
  label,
  name,
}: {
  selected: boolean
  onSelect: () => void
  label: string
  name: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <span
        className={cn(
          'box-border flex size-5 shrink-0 items-center justify-center rounded-full',
          selected
            ? 'border-[0.5px] border-vess-primary-500 bg-vess-grey-50 p-px'
            : 'border border-vess-grey-200 bg-vess-grey-50',
        )}
        aria-hidden
      >
        {selected && (
          <span
            className="size-2.5 shrink-0 rounded-full border-[3px] border-vess-primary-500 bg-vess-grey-50"
            aria-hidden
          />
        )}
      </span>
      <span className="text-[15px] font-normal leading-[18px] text-vess-grey-950">{label}</span>
    </label>
  )
}
