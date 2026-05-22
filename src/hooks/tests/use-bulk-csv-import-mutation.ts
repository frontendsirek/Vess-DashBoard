import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resolveApiSuccessMessage } from '@/lib/format-api-success-message'
import { testQueryKeys } from '@/lib/test-query-keys'
import { testService } from '@/services/test.service'

export function useBulkCsvImportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...testQueryKeys.all, 'bulk-csv-import'],
    mutationFn: async (file: File) => {
      const { data } = await testService.bulkCreateTestsFromCsv(file)
      if (!data.isSuccess) {
        const msg = data.error?.description ?? data.message ?? 'Bulk CSV import failed.'
        throw new Error(msg)
      }
      return data
    },
    onSuccess: (data) => {
      const successCount = data.data.successCount
      const failureCount = data.data.failureCount

      if (successCount > 0) {
        void queryClient.invalidateQueries({ queryKey: testQueryKeys.all })
      }

      if (successCount === 0 && failureCount === 0) return

      const rowSuffix = failureCount === 1 ? 'row' : 'rows'
      const importedRowsTitle = `Imported ${successCount} row${successCount === 1 ? '' : 's'}.`

      if (failureCount === 0) {
        toast.success(resolveApiSuccessMessage(data, importedRowsTitle))
        return
      }

      if (successCount > 0) {
        toast.success(resolveApiSuccessMessage(data, importedRowsTitle), {
          description: `${failureCount} ${rowSuffix} could not be imported.`,
        })
        return
      }

      toast.error(
        resolveApiSuccessMessage(
          data,
          `Could not import this file. ${failureCount} ${rowSuffix} failed.`,
        ),
      )
    },
  })
}
