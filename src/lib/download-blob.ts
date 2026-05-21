/** RFC 5987 filename*= or quoted filename from Content-Disposition. */
export function parseFilenameFromContentDisposition(header: string | undefined): string | null {
  if (!header) return null
  const utfMatch = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return utfMatch[1].trim().replace(/^"|"$/g, '')
    }
  }
  const asciiMatch = /filename="([^"]+)"/i.exec(header)
  if (asciiMatch?.[1]) return asciiMatch[1]
  const looseMatch = /filename=([^;\s]+)/i.exec(header)
  if (looseMatch?.[1]) return looseMatch[1].replace(/^"|"$/g, '')
  return null
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
