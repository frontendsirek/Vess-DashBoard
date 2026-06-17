import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  api: {
    bodyParser: false,
  },
}

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const FORWARDED_REQUEST_HEADERS = [
  'authorization',
  'content-type',
  'x-tenant-id',
  'x-api-key',
  'accept',
]

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

  // The "path" query param is set by vercel.json rewrites
  // e.g. /auth/api/v1/auth/login/ → ?path=/auth/api/v1/auth/login/
  const pathParam = req.query.path
  const upstreamPath = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || '/'
  const upstreamUrl = `${API_BASE_URL.replace(/\/+$/, '')}${upstreamPath}`

  // Forward relevant headers
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

    // Relay response headers
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
