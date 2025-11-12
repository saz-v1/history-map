import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/history-map/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            // Other node_modules go into vendor chunk
            return 'vendor';
          }
        },
      },
    },
    cssCodeSplit: false, // Single CSS file for better caching
    minify: 'esbuild', // Use esbuild for fast minification
    // Note: esbuild doesn't support drop_console, but it's faster
  },
})
