/**
 * Specialized Form Input Components for MedFlow Appointment Management
 * 
 * Features:
 * - Medical-themed validation with real-time feedback
 * - Romanian localization for medical professionals
 * - MedFlow branding and accessibility
 * - AI integration placeholders for smart suggestions
 * - Professional medical form styling
 * 
 * @author MedFlow Team
 * @version 2.0
 * 
 * @deprecated This file is deprecated. Use the new form system from './forms' instead.
 * The new system provides the same functionality with better modularity and performance.
 */

import React from 'react'
import { FormInput } from './forms'

// Re-export the new FormInput component for backward compatibility
export const MedicalTextInput = FormInput
export const MedicalTextArea = FormInput
export const MedicalDateTimeInput = FormInput
export const MedicalSelectInput = FormInput
