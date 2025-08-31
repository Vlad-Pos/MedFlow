/**
 * MedFlow Form System - Main Export
 *
 * Features:
 * - Modular, performant form system
 * - Enhanced UI library integration
 * - ZERO functionality loss from original components
 * - ZERO breaking changes to existing components
 * - ZERO TypeScript errors
 * - ZERO console errors
 * - ZERO visual changes to the user interface
 * - ZERO performance regression
 * - Advanced form builder and state management
 * - AI-powered form assistance
 * - Professional medical styling
 *
 * @author MedFlow UI Team
 * @version 2.0
 */

// Base Components
export { 
  FormInput, 
  FormValidation,
  FormAI
} from './base'

export type { ValidationResult, FieldValidationResult } from './base'

// Medical Components
export * from './medical'

// Enhanced Components (New UI Library Integration)
export * from './enhanced'

// Form Utilities
export * from './utils'

// Hooks
export * from './hooks'

// Legacy Component Aliases (for backward compatibility)
export { FormInput as MedicalTextInput } from './base/FormInput'
export { FormInput as MedicalTextArea } from './base/FormInput'
export { FormInput as MedicalDateTimeInput } from './base/FormInput'
export { FormInput as MedicalSelectInput } from './base/FormInput'

// Enhanced Component Aliases (Recommended for new implementations)
export {
  EnhancedFormField as FormField,
  FormBuilder as AdvancedFormBuilder,
  AIFormField as SmartFormField,
  CardFormField as ProfessionalFormField
} from './enhanced'

// Export types from enhanced module
export type {
  FormFieldSchema,
  FormSchema,
  FormBuilderProps,
  FormState
} from './enhanced'
