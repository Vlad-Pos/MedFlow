/**
 * 🏥 MedFlow - Tailwind CSS Configuration
 * 
 * 💡 AI Agent Guidance:
 * Before modifying this configuration, please review:
 * - MedFlow/BRAND_IDENTITY.md (brand guidelines and colors)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * - MedFlow/FEATURES_DOCUMENTATION.md (feature implementation)
 * 
 * This ensures your styling changes align with MedFlow's brand identity.
 * No enforcement - just helpful guidance for quality work! 🚀
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NEW MedFlow Brand Colors - 12-Color Transformed Scheme
        'medflow-background': '#100B1A', // Secondary Background (Really Deep Purple)
        'medflow-primary': '#8A7A9F',    // Logo Color (Neutral Purple)
        'medflow-secondary': '#7A48BF',  // Secondary Floating Button (Basic Purple V1)
        
        // Official MedFlow brand colors - NEW TRANSFORMED SCHEME
        'brand': {
          100: '#8A7A9F', // Logo Color (Neutral Purple)
          200: '#7A48BF', // Secondary Floating Button (Basic Purple V1)
          300: '#804AC8', // Secondary Normal Button (Basic Purple V2)
          400: '#25153A', // Gradient (Dark Purple)
          500: '#231A2F', // Extra Color 1 (Plum Purple)
          600: '#100B1A', // Secondary Background (Really Deep Purple)
          700: '#000000', // Main Background (Pure Black)
        },
        
        // Legacy colors for compatibility - UPDATED TO NEW SCHEME
        'medflow-blue': '#25153A',    // Now uses Gradient color
        'medflow-green': '#7A48BF',   // Now uses Secondary Floating Button color
        
        // Enhanced semantic colors with NEW MedFlow theme
        'medflow': {
          50: '#faf8fc',
          100: '#f4f0f8',
          200: '#e9e0f0',
          300: '#d8c5e3',
          400: '#c19dd2',
          500: '#8A7A9F', // Logo Color (Neutral Purple)
          600: '#7A48BF', // Secondary Floating Button (Basic Purple V1)
          700: '#804AC8', // Secondary Normal Button (Basic Purple V2)
          800: '#25153A', // Gradient (Dark Purple)
          900: '#231A2F', // Extra Color 1 (Plum Purple)
          950: '#100B1A', // Secondary Background (Really Deep Purple)
        },
        
        // Medical context colors - UPDATED TO NEW SCHEME
        'medical': {
          emergency: '#ef4444',
          warning: '#f59e0b',
          success: '#7A48BF',    // Now uses Secondary Floating Button color
          info: '#8A7A9F',       // Now uses Logo Color
          neutral: '#6b7280',
        },
        
        // Enhanced contrast dark gradient theme system - UPDATED
        'medflow': {
          'gradient': 'var(--medflow-gradient-primary)',
          'accent': {
            DEFAULT: 'rgb(var(--medflow-accent) / <alpha-value>)',
            'hover': 'rgb(var(--medflow-accent-hover) / <alpha-value>)',
            'dark': 'rgb(var(--medflow-accent-dark) / <alpha-value>)',
          },
          'text': {
            'primary': 'var(--medflow-text-primary)',
            'secondary': 'var(--medflow-text-secondary)',
            'muted': 'var(--medflow-text-muted)',
            'high-contrast': '#FFFFFF',
            'high-contrast-secondary': '#F8FAFC',
            'high-contrast-muted': '#E5E7EB',
          },
          'surface': {
            DEFAULT: 'rgb(var(--medflow-surface) / <alpha-value>)',
            'elevated': 'rgb(var(--medflow-surface-elevated) / <alpha-value>)',
            'high-contrast': 'rgba(16, 11, 26, 0.95)',  // Updated to #100B1A
            'elevated-high-contrast': 'rgba(37, 21, 58, 0.95)', // Updated to #25153A
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(138, 122, 159, 0.5)' }, // Updated to #8A7A9F
          '100%': { boxShadow: '0 0 20px rgba(138, 122, 159, 0.8)' }, // Updated to #8A7A9F
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'medflow-sm': 'var(--medflow-shadow-sm)',
        'medflow': 'var(--medflow-shadow)',
        'medflow-lg': 'var(--medflow-shadow-lg)',
        'medflow-xl': 'var(--medflow-shadow-xl)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(138, 122, 159, 0.1)', // Updated to #8A7A9F
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

