import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core - cached separately
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          // UI icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Heavy export deps
          if (id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf') || id.includes('node_modules/xlsx')) {
            return 'vendor-export';
          }
          // Confetti
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
        }
      }
    }
  }
})
