import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET

  // Proxy is only used during local dev — not needed for production build
  if (command === 'serve' && !apiTarget) {
    throw new Error('Missing API_PROXY_TARGET in .env – cannot configure dev proxy.')
  }

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
      proxy: apiTarget
        ? {
            '/auth/api': {
              target: apiTarget,
              changeOrigin: true,
            },
            '/device/api': {
              target: apiTarget,
              changeOrigin: true,
            },
            '/device/health': {
              target: apiTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  }
})
