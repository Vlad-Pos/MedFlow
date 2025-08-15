/**
 * MedFlow Brand Color Utilities
 * Provides consistent brand color application across the application
 */

// Brand color hex values for direct use
export const BRAND_COLORS = {
  brand1: '#8A7A9F', // Logo Color (Neutral Purple)
  brand2: '#7A48BF', // Secondary Floating Button (Basic Purple V1)
  brand3: '#804AC8', // Secondary Normal Button (Basic Purple V2)
  brand4: '#25153A', // Gradient (Dark Purple)
  brand5: '#231A2F', // Extra Color 1 (Plum Purple)
  brand6: '#100B1A', // Secondary Background (Really Deep Purple)
  brand7: '#000000', // Main Background (Pure Black)
} as const

// Brand color RGBA values for borders with opacity
export const BRAND_COLORS_RGBA = {
  brand1: 'rgba(138, 122, 159, 0.3)', // Logo Color with 30% opacity
  brand2: 'rgba(122, 72, 191, 0.3)',  // Secondary Floating Button with 30% opacity
  brand3: 'rgba(128, 74, 200, 0.3)',  // Secondary Normal Button with 30% opacity
  brand4: 'rgba(37, 21, 58, 0.3)',    // Gradient with 30% opacity
  brand5: 'rgba(35, 26, 47, 0.3)',    // Extra Color 1 with 30% opacity
  brand6: 'rgba(16, 11, 26, 0.3)',    // Secondary Background with 30% opacity
  brand7: 'rgba(0, 0, 0, 0.3)',       // Main Background with 30% opacity
} as const

// Utility function to get brand color border style
export function getBrandBorderStyle(brandKey: keyof typeof BRAND_COLORS_RGBA, opacity: number = 0.3) {
  const hexColor = BRAND_COLORS[brandKey]
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  return {
    border: `1px solid rgba(${r}, ${g}, ${b}, ${opacity})`
  }
}

// Pre-defined border styles for common use cases
export const BRAND_BORDER_STYLES = {
  brand1: getBrandBorderStyle('brand1'),
  brand2: getBrandBorderStyle('brand2'),
  brand3: getBrandBorderStyle('brand3'),
  brand4: getBrandBorderStyle('brand4'),
  brand5: getBrandBorderStyle('brand5'),
  brand6: getBrandBorderStyle('brand6'),
  brand7: getBrandBorderStyle('brand7'),
} as const

// Type for brand color keys
export type BrandColorKey = keyof typeof BRAND_COLORS

// Utility to get CSS variable string
export function getBrandCSSVariable(brandKey: BrandColorKey) {
  return `var(--medflow-${brandKey})`
}

// Utility to get CSS variable with opacity
export function getBrandCSSVariableWithOpacity(brandKey: BrandColorKey, opacity: number) {
  return `var(--medflow-${brandKey})/${Math.round(opacity * 100)}`
}
