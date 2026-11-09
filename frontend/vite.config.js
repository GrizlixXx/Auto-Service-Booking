import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api requests to Express during development
      '/api': {
        target: 'http://localhost:4200',
        changeOrigin: true,
      },
      '/src': {
        target: 'http://localhost:4200',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
