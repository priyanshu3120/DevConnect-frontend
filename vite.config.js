import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,        // Always use port 5173
    strictPort: true,  // Error immediately if 5173 is taken (don't silently switch)
    open: true,        // Auto-open browser on npm run dev
    proxy: {
      // All requests starting with /api are forwarded to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // strips /api prefix
        secure: false,
      },
    },
  },
})


