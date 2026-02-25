import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charting library (heaviest single dep ~300KB)
          'vendor-recharts': ['recharts'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // Date utilities
          'vendor-dates': ['date-fns'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // State management
          'vendor-state': ['zustand'],
        },
      },
    },
    // Raise limit slightly so we see the actual breakdown without noise
    chunkSizeWarningLimit: 600,
  },
})
