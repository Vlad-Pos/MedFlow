import { LucideIcon } from 'lucide-react'

/**
 * Navigation Item Interface
 * 
 * Defines the structure of navigation items with proper typing
 */
export interface NavigationItem {
  to: string
  label: string
  icon: LucideIcon
  description: string
  priority: number
}

/**
 * Navigation Items Array Type
 * 
 * Array of navigation items for type safety
 */
export type NavigationItems = NavigationItem[]
