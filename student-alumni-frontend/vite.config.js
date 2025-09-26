import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    build: {
    sourcemap: false, // disables eval-based source maps
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
})

