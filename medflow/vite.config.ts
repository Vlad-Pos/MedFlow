/**
 * 🏥 MedFlow - Vite Build Configuration
 * 
 * 💡 AI Agent Guidance:
 * Before modifying this configuration, please review:
 * - MedFlow/BRAND_IDENTITY.md (brand guidelines and colors)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * - MedFlow/FEATURES_DOCUMENTATION.md (feature implementation)
 * 
 * This ensures your build optimizations align with MedFlow's performance standards.
 * No enforcement - just helpful guidance for quality work! 🚀
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Enterprise-grade Vite configuration for optimal performance
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020', // Modern target for better tree-shaking and performance
    minify: 'terser', // Advanced minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      } as any
    } as any,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks - minimal and optimized
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // Animation libraries - separate to avoid blocking main bundle
          'animations': ['framer-motion', 'gsap'],
          
          // UI components - lightweight and frequently used
          'ui-core': ['lucide-react'],
          
          // Calendar functionality - heavy but isolated
          'calendar': ['react-big-calendar', 'date-fns', 'dayjs'],
          
          // Firebase services - separate to allow lazy loading
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-db': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage'],
          
          // Feature-based chunks for better caching
          'auth-features': [
            './src/pages/auth/SignIn.tsx',
            './src/pages/auth/SignUp.tsx', 
            './src/pages/auth/ResetPassword.tsx',
            './src/providers/AuthProvider.tsx'
          ],
          'dashboard-features': [
            './src/pages/Dashboard.tsx',
            './src/pages/Profile.tsx',
            './src/components/ModernCalendar.tsx'
          ],
          'appointment-features': [
            './src/pages/Appointments.tsx',
            './src/components/AppointmentForm.tsx'
          ],
          'analytics-features': [
            './src/pages/Analytics.tsx',
            './src/components/PatientReportForm.tsx'
          ],
          
          // Utility chunks
          'utils-core': [
            './src/utils/demo.ts',
            './src/utils/dateUtils.ts',
            './src/utils/animations.ts'
          ],
          'utils-ai': [
            './src/utils/ai.ts',
            './src/services/aiService.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500, // Stricter limit for better optimization
    sourcemap: false, // Disable sourcemaps in production for better performance
    reportCompressedSize: true, // Enable size reporting for monitoring
    cssCodeSplit: true, // Split CSS for better caching
    assetsInlineLimit: 4096 // Inline small assets for better performance
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react'
    ],
    exclude: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ]
  },
  server: {
    port: 5174, // Set default development port to 5174
    hmr: {
      overlay: false // Disable error overlay for better performance
    }
  }
})