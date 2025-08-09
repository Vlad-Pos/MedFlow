/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced MedFlow branding colors
        'medflow-background': '#4c5165',
        'medflow-primary': '#9e85b0',
        'medflow-secondary': '#9479a8',
        
        // Legacy colors for compatibility
        'medflow-blue': '#3B82F6',
        'medflow-green': '#10B981',
        
        // Enhanced semantic colors with MedFlow theme
        'medflow': {
          50: '#faf8fc',
          100: '#f4f0f8',
          200: '#e9e0f0',
          300: '#d8c5e3',
          400: '#c19dd2',
          500: '#9e85b0', // Primary
          600: '#9479a8', // Secondary
          700: '#7d6694',
          800: '#695579',
          900: '#574762',
          950: '#3a2f42',
        },
        
        // Medical context colors
        'medical': {
          emergency: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          info: '#3b82f6',
          neutral: '#6b7280',
        },
        
        // Enhanced contrast dark gradient theme system
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
            'high-contrast': 'rgba(30, 36, 58, 0.95)',
            'elevated-high-contrast': 'rgba(45, 51, 73, 0.95)',
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
          '0%': { boxShadow: '0 0 5px rgba(158, 133, 176, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(158, 133, 176, 0.8)' },
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
        'inner-glow': 'inset 0 2px 4px 0 rgba(158, 133, 176, 0.1)',
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

