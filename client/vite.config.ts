import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3037,
    proxy: {
      '/api': {
        target: 'http://localhost:3038',
        changeOrigin: true
      }
    }
  }
})
