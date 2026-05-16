import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/clarifai-proxy': {
        target: 'https://api.clarifai.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/clarifai-proxy/, ''),
      },
    },
  },
})