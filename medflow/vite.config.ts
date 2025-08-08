import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react','react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-firebase': ['firebase/app','firebase/auth','firebase/firestore','firebase/storage']
        }
      }
    }
  }
})
