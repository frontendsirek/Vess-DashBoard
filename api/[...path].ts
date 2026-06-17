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

  // Use req.url to preserve the original path (including trailing slashes).
  // req.url is relative, e.g. "/api/auth/api/v1/auth/login/?foo=bar"
  const originalUrl = req.url || ''
  // Strip the leading "/api" prefix to get the upstream path + query
  const stripped = originalUrl.replace(/^\/api/, '')
  const upstreamUrl = `${API_BASE_URL.replace(/\/+$/, '')}${stripped}`

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
    const upstream = await fetch(upstreamUrl, {
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
