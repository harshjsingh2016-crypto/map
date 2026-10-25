import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Follows the API server's own port var, so a second instance can run beside the first.
        target: `http://localhost:${process.env.MAP_SERVER_PORT || 5175}`,
        changeOrigin: true,
      },
    },
  },
})
