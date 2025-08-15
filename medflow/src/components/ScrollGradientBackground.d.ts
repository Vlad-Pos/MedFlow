import React from "react";
/**
 * ScrollGradientBackground Component
 *
 * Provides a scroll-triggered background gradient animation that smoothly
 * transitions through MedFlow brand colors based on vertical scroll progress.
 *
 * Features:
 * - Performance optimized with throttled scroll handling
 * - Smooth CSS transitions for gradient changes
 * - Fallback backgrounds for older browsers
 * - Accessibility compliant with proper contrast
 * - Responsive design using Tailwind CSS
 * - Clean, maintainable TypeScript code
 *
 * @param children - React nodes to render inside the gradient background
 * @returns Motion div with scroll-triggered gradient background
 */
declare const ScrollGradientBackground: React.FC<{
    children: React.ReactNode;
}>;
export default ScrollGradientBackground;
