import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  let proxy

  try {
    const apiUrl = new URL(env.VITE_API_BASE_URL)
    proxy = {
      [apiUrl.pathname]: {
        target: apiUrl.origin,
        changeOrigin: true,
      },
    }
  } catch {
    proxy = undefined
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
  }
})
