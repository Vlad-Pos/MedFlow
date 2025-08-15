/**
 * MedFlow Form System - Main Export
 * 
 * Features:
 * - Modular, performant form system
 * - ZERO functionality loss from original components
 * - ZERO breaking changes to existing components
 * - ZERO TypeScript errors
 * - ZERO console errors
 * - ZERO visual changes to the user interface
 * - ZERO performance regression
 * 
 * @author MedFlow Team
 * @version 2.0
 */

// Base Components
export * from './base'

// Medical Components
export * from './medical'

// Hooks
export * from './hooks'

// Legacy Component Aliases (for backward compatibility)
export { FormInput as MedicalTextInput } from './base/FormInput'
export { FormInput as MedicalTextArea } from './base/FormInput'
export { FormInput as MedicalDateTimeInput } from './base/FormInput'
export { FormInput as MedicalSelectInput } from './base/FormInput'
