import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In development, /api requests are proxied to the FastAPI server so the
// browser talks to a same-origin endpoint and never holds an API key.
// In production the app is served same-origin behind a reverse proxy, so the
// relative /api/chat path resolves to the same backend without any change.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
