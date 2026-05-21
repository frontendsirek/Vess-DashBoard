import { useMutation, useQueryClient } from '@tanstack/react-query'
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
      if (data.data.successCount > 0) {
        void queryClient.invalidateQueries({ queryKey: testQueryKeys.all })
      }
    },
  })
}
