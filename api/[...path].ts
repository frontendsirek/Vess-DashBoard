import type { VercelRequest, VercelResponse } from '@vercel/node'

// Disable default body parsing so we can forward raw bodies (file uploads, etc.)
export const config = {
  api: {
    bodyParser: false,
  },
}

/** Collect the raw request body as a Buffer. */
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/** Headers we forward from the client request to the upstream API. */
const FORWARDED_REQUEST_HEADERS = [
  'authorization',
  'content-type',
  'x-tenant-id',
  'x-api-key',
  'accept',
]

/** Response headers we should NOT relay back to the client. */
const SKIPPED_RESPONSE_HEADERS = new Set([
  'transfer-encoding',
  'connection',
  'keep-alive',
])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const API_BASE_URL = process.env.API_BASE_URL
  if (!API_BASE_URL) {
    return res.status(500).json({ error: 'API_BASE_URL is not configured' })
  }

  // Build the upstream URL from the catch-all path segments
  const { path: segments } = req.query
  const targetPath = Array.isArray(segments) ? segments.join('/') : segments || ''
  const url = new URL(`${API_BASE_URL.replace(/\/+$/, '')}/${targetPath}`)

  // Forward query-string parameters (skip the internal "path" param)
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue
    const values = Array.isArray(value) ? value : [value]
    for (const v of values) {
      if (v != null) url.searchParams.append(key, v)
    }
  }

  // Build request headers
  const headers: Record<string, string> = {}
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const val = req.headers[name]
    if (val) headers[name] = Array.isArray(val) ? val[0] : val
  }

  // Read raw body for non-GET/HEAD methods
  const hasBody = !['GET', 'HEAD'].includes(req.method || 'GET')
  const body = hasBody ? await getRawBody(req) : undefined

  try {
    const upstream = await fetch(url.toString(), {
      method: req.method || 'GET',
      headers,
      body,
    })

    // Relay upstream response headers
    upstream.headers.forEach((value, key) => {
      if (!SKIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value)
      }
    })

    const buffer = Buffer.from(await upstream.arrayBuffer())
    return res.status(upstream.status).send(buffer)
  } catch (err) {
    console.error('Proxy error:', err)
    return res.status(502).json({ error: 'Bad gateway' })
  }
}
