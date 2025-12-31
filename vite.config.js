import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// https://vite.dev/config/
const resolveBuildHash = () => {
  if (process.env.VITE_BUILD_HASH) return process.env.VITE_BUILD_HASH
  if (process.env.BUILD_HASH) return process.env.BUILD_HASH
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch (error) {
    return 'dev'
  }
}

const buildHash = resolveBuildHash()

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/docs': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(buildHash),
  },
})
