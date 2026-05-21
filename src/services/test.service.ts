import { AxiosHeaders } from 'axios'
import { apiClient } from '@/lib/axios-client'
import { parseFilenameFromContentDisposition } from '@/lib/download-blob'
import type { ApiEnvelope } from '@/types/api'
import type {
  ApiCommand,
  ApiTest,
  BulkCsvImportResponse,
  BulkTemplateEnvelope,
  CreateTestPayload,
  GetProbeResponse,
  ListProbesParams,
  ListProbesResponse,
  PullCommandsParams,
  TestsDashboardParams,
  TestsDashboardResponse,
  UpdateTestPayload,
} from '@/types/test'

const DEFAULT_BULK_TEMPLATE_FILENAME = 'bulk-tests-template.csv'

function normalizeResponseContentType(header: unknown): string {
  const raw =
    typeof header === 'string' ? header : Array.isArray(header) ? header[0] : ''
  return raw.split(';')[0]?.trim().toLowerCase() ?? ''
}

function contentTypeIsJson(ct: string): boolean {
  return ct.includes('application/json') || ct.includes('+json')
}

function throwBulkTemplateUnavailable(body: BulkTemplateEnvelope): never {
  const msg = body.error?.description ?? body.message ?? 'Bulk template file is unavailable.'
  throw new Error(msg)
}

/** Parse JSON envelope from blob when API returns errors as JSON while responseType is blob. */
async function tryParseBulkTemplateEnvelope(blob: Blob): Promise<BulkTemplateEnvelope | null> {
  const text = await blob.text()
  try {
    const parsed = JSON.parse(text) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'isSuccess' in parsed &&
      typeof (parsed as BulkTemplateEnvelope).isSuccess === 'boolean'
    ) {
      return parsed as BulkTemplateEnvelope
    }
    return null
  } catch {
    return null
  }
}

const TEST_API_BASE = '/test/v1'
const TESTS_PREFIX = `${TEST_API_BASE}/tests`
const COMMANDS_PREFIX = `${TEST_API_BASE}/commands`

export const testService = {
  health() {
    return apiClient.get(`${TEST_API_BASE}/health`)
  },

  listProbes(params?: ListProbesParams) {
    return apiClient.get<ListProbesResponse>(TESTS_PREFIX, {
      params,
    })
  },

  getTestsDashboard(params?: TestsDashboardParams) {
    return apiClient.get<TestsDashboardResponse>(`${TESTS_PREFIX}/dashboard`, {
      params,
    })
  },

  getProbe(testId: string) {
    return apiClient.get<GetProbeResponse>(
      `${TESTS_PREFIX}/${encodeURIComponent(testId)}`,
    )
  },

  createTest(payload: CreateTestPayload) {
    return apiClient.post<ApiTest | ApiEnvelope<ApiTest>>(TESTS_PREFIX, payload)
  },

  async downloadBulkTestsTemplate(): Promise<{ blob: Blob; filename: string }> {
    const response = await apiClient.get<Blob>(`${TESTS_PREFIX}/bulk/template`, {
      responseType: 'blob',
      validateStatus: () => true,
    })
    const blob = response.data
    const status = response.status
    const ct = normalizeResponseContentType(response.headers['content-type'])
    const preview = (await blob.slice(0, 512).text()).trimStart()
    const looksLikeEnvelope =
      contentTypeIsJson(ct) || preview.startsWith('{')

    if (looksLikeEnvelope) {
      const envelope = await tryParseBulkTemplateEnvelope(blob)
      if (envelope) {
        if (!envelope.isSuccess) {
          throwBulkTemplateUnavailable(envelope)
        }
        throw new Error(
          envelope.message ?? 'Bulk template response was not a CSV file.',
        )
      }
      if (status >= 200 && status < 300) {
        throw new Error('Bulk template response was not valid JSON.')
      }
      throw new Error(`Bulk template request failed (${status}).`)
    }

    if (status < 200 || status >= 300) {
      throw new Error(`Bulk template request failed (${status}).`)
    }

    const disposition = response.headers['content-disposition']
    const dispositionStr =
      typeof disposition === 'string' ?
        disposition
      : Array.isArray(disposition) ?
        disposition[0]
      : undefined
    const parsedName = parseFilenameFromContentDisposition(dispositionStr)
    const filename = parsedName ?? DEFAULT_BULK_TEMPLATE_FILENAME
    return { blob, filename }
  },

  bulkCreateTestsFromCsv(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const headers = new AxiosHeaders()
    headers.delete('Content-Type')
    return apiClient.post<BulkCsvImportResponse>(`${TESTS_PREFIX}/bulk/csv`, formData, {
      headers,
    })
  },

  updateTest(testId: string, payload: UpdateTestPayload) {
    return apiClient.patch<ApiTest | ApiEnvelope<ApiTest>>(
      `${TESTS_PREFIX}/${testId}`,
      payload,
    )
  },

  pullCommands(params: PullCommandsParams) {
    return apiClient.get<ApiCommand[] | ApiEnvelope<ApiCommand[]>>(COMMANDS_PREFIX, {
      params,
    })
  },
}
