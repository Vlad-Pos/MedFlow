// Responsive breakpoints and utilities
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

// Responsive spacing utilities
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
  '2xl': '4rem'    // 64px
}

// Responsive typography scale
export const typography = {
  xs: {
    fontSize: '0.75rem',    // 12px
    lineHeight: '1rem'      // 16px
  },
  sm: {
    fontSize: '0.875rem',   // 14px
    lineHeight: '1.25rem'   // 20px
  },
  base: {
    fontSize: '1rem',       // 16px
    lineHeight: '1.5rem'    // 24px
  },
  lg: {
    fontSize: '1.125rem',   // 18px
    lineHeight: '1.75rem'   // 28px
  },
  xl: {
    fontSize: '1.25rem',    // 20px
    lineHeight: '1.75rem'   // 28px
  },
  '2xl': {
    fontSize: '1.5rem',     // 24px
    lineHeight: '2rem'      // 32px
  },
  '3xl': {
    fontSize: '1.875rem',   // 30px
    lineHeight: '2.25rem'   // 36px
  },
  '4xl': {
    fontSize: '2.25rem',    // 36px
    lineHeight: '2.5rem'    // 40px
  }
}

// Responsive grid configurations
export const gridConfig = {
  mobile: {
    columns: 1,
    gap: spacing.sm
  },
  tablet: {
    columns: 2,
    gap: spacing.md
  },
  desktop: {
    columns: 3,
    gap: spacing.lg
  },
  wide: {
    columns: 4,
    gap: spacing.xl
  }
}

// Touch-friendly sizing
export const touchTargets = {
  minSize: '44px',
  minPadding: '12px',
  minSpacing: '8px'
}

// Responsive container widths
export const containerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

// Utility functions for responsive design
export const responsive = {
  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Check if device is mobile
  isMobile: () => {
    return window.innerWidth < 768
  },

  // Check if device is tablet
  isTablet: () => {
    return window.innerWidth >= 768 && window.innerWidth < 1024
  },

  // Check if device is desktop
  isDesktop: () => {
    return window.innerWidth >= 1024
  },

  // Get current breakpoint
  getBreakpoint: () => {
    const width = window.innerWidth
    if (width < 640) return 'xs'
    if (width < 768) return 'sm'
    if (width < 1024) return 'md'
    if (width < 1280) return 'lg'
    if (width < 1536) return 'xl'
    return '2xl'
  },

  // Responsive class generator
  getResponsiveClass: (baseClass: string, responsiveClasses: Record<string, string>) => {
    let classes = baseClass
    Object.entries(responsiveClasses).forEach(([breakpoint, className]) => {
      if (breakpoint === 'base') {
        classes += ` ${className}`
      } else {
        classes += ` ${breakpoint}:${className}`
      }
    })
    return classes
  }
}

// CSS-in-JS responsive helpers
export const responsiveStyles = {
  // Responsive padding
  padding: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem'
  },

  // Responsive margins
  margin: {
    mobile: '0.5rem',
    tablet: '1rem',
    desktop: '1.5rem'
  },

  // Responsive font sizes
  fontSize: {
    mobile: '0.875rem',
    tablet: '1rem',
    desktop: '1.125rem'
  },

  // Responsive line heights
  lineHeight: {
    mobile: '1.25rem',
    tablet: '1.5rem',
    desktop: '1.75rem'
  }
}

// Accessibility helpers for responsive design
export const accessibility = {
  // Minimum touch target size
  minTouchTarget: '44px',
  
  // Minimum spacing between touch targets
  minTouchSpacing: '8px',
  
  // Focus indicator styles
  focusRing: '0 0 0 2px rgba(59, 130, 246, 0.5)',
  
  // High contrast mode support
  highContrast: {
    border: '2px solid',
    background: 'rgba(255, 255, 255, 0.9)'
  }
}

// Performance optimizations for responsive design
export const performance = {
  // Debounce resize events
  debounceDelay: 150,
  
  // Throttle scroll events
  throttleDelay: 16,
  
  // Lazy loading threshold
  lazyLoadThreshold: 0.1,
  
  // Animation frame rate
  targetFrameRate: 60
}

// Mobile-specific utilities
export const mobile = {
  // Safe area insets
  safeArea: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)'
  },
  
  // Viewport height for mobile browsers
  viewportHeight: '100dvh',
  
  // Prevent zoom on input focus
  preventZoom: `
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    input[type="tel"],
    input[type="url"],
    textarea,
    select {
      font-size: 16px !important;
    }
  `
}

