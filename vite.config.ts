import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_ prefixed) so we can read API_PROXY_TARGET
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (p) => {
            // Strip /api prefix, then map to ALB service paths:
            //   /api/v1/auth/*         → /auth/api/v1/auth/*
            //   /api/v1/users/*        → /auth/api/v1/users/*
            //   /api/v1/devices/*      → /device/api/v1/devices/*
            //   /api/v1/registration/* → /device/api/v1/registration/*
            //   /api/test/*            → /test/*
            const stripped = p.replace(/^\/api/, '')
            const routes: [RegExp, string][] = [
              [/^\/v1\/auth(\/|$)/, '/auth/api/v1/auth'],
              [/^\/v1\/users(\/|$)/, '/auth/api/v1/users'],
              [/^\/v1\/devices(\/|$)/, '/device/api/v1/devices'],
              [/^\/v1\/registration(\/|$)/, '/device/api/v1/registration'],
            ]
            for (const [pattern, prefix] of routes) {
              if (pattern.test(stripped)) {
                const resource = stripped.match(/^\/v1\/\w+/)?.[0] ?? ''
                return stripped.replace(resource, prefix)
              }
            }
            return stripped
          },
        },
      },
    },
  }
})
