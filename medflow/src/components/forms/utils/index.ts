/**
 * Form Utilities Export
 * Advanced form utilities and validation helpers
 */

export {
  validateField,
  validateRule,
  validateForm,
  validateCNP,
  validateDiagnosis,
  validateSymptoms,
  createValidationRules,
  transformFormData,
  createInitialFormState,
  updateFormField,
  isFormValid,
  isFormDirty,
  getFormValues,
  resetForm
} from './formUtils'

export {
  validationMessages,
  medicalPatterns
} from './formUtils'

export type {
  ValidationRule,
  ValidationResult,
  FormFieldState,
  FormState
} from './formUtils'
