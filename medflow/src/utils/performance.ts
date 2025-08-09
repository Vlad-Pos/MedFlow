/**
 * Performance optimization utilities for n8n.io-inspired redesign
 * GPU acceleration and memory management
 */

// Force GPU acceleration for animations
export const enableGPUAcceleration = () => {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    .fade-in,
    .hero-title,
    .section,
    [class*="motion-"],
    [class*="animate-"] {
      transform: translateZ(0);
      will-change: transform, opacity;
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Optimize for 60fps animations */
    @media (prefers-reduced-motion: no-preference) {
      * {
        animation-duration: 0.3s;
        transition-duration: 0.3s;
      }
    }
    
    /* Disable animations on slow devices */
    @media (max-width: 768px) and (max-height: 1024px) {
      .fade-in {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);
};

// Preload critical assets
export const preloadCriticalAssets = () => {
  if (typeof window === 'undefined') return;

  // Preload the logo
  const logoLink = document.createElement('link');
  logoLink.rel = 'preload';
  logoLink.href = '/src/assets/medflow-logo.svg';
  logoLink.as = 'image';
  document.head.appendChild(logoLink);
};

// Debounced scroll handler for better performance
export const createDebouncedScrollHandler = (callback: () => void, delay = 16) => {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

// Memory leak prevention
export const cleanupAnimations = () => {
  if (typeof window === 'undefined') return;

  // Remove all event listeners on unmount
  const events = ['scroll', 'resize', 'mousemove'];
  events.forEach(event => {
    const listeners = (window as any)._eventListeners?.[event] || [];
    listeners.forEach((listener: EventListener) => {
      window.removeEventListener(event, listener);
    });
  });
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;

  enableGPUAcceleration();
  preloadCriticalAssets();
  
  // Defer non-critical operations
  window.requestIdleCallback?.(() => {
    // Initialize analytics or other non-critical features here
    console.log('Performance optimizations initialized');
  });

  return cleanupAnimations;
};