import type { DeviceExportFormat } from '@/types/device'

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Downloads JSON export payloads or raw CSV text from device-service export endpoints. */
export function downloadExportFile(
  data: unknown,
  filenameBase: string,
  format: DeviceExportFormat = 'json',
) {
  const safeBase = filenameBase.replace(/[^\w.-]+/g, '_')

  if (format === 'csv') {
    const csvText = typeof data === 'string' ? data : String(data ?? '')
    triggerBrowserDownload(new Blob([csvText], { type: 'text/csv;charset=utf-8' }), `${safeBase}.csv`)
    return
  }

  const jsonText = JSON.stringify(data, null, 2)
  triggerBrowserDownload(
    new Blob([jsonText], { type: 'application/json;charset=utf-8' }),
    `${safeBase}.json`,
  )
}
