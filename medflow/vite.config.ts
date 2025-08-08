import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          
          // Feature chunks
          'auth': ['./src/pages/auth/SignIn.tsx', './src/pages/auth/SignUp.tsx', './src/pages/auth/ResetPassword.tsx'],
          'dashboard': ['./src/pages/Dashboard.tsx', './src/pages/Profile.tsx'],
          'appointments': ['./src/pages/Appointments.tsx', './src/components/AppointmentForm.tsx', './src/components/ModernCalendar.tsx'],
          'analytics': ['./src/pages/Analytics.tsx'],
          
          // Utils
          'utils': ['./src/utils/demo.ts', './src/utils/dateUtils.ts', './src/utils/ai.ts'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})