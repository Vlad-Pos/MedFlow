import { InputProps } from '../../core/Input/Input.types'
import { LucideIcon } from 'lucide-react'

export type MedicalInputVariant = 'default' | 'outlined' | 'filled' | 'medical'
export type MedicalInputState = 'default' | 'error' | 'success' | 'warning'

export interface MedicalInputProps extends Omit<InputProps, 'variant'> {
  variant?: MedicalInputVariant
  warning?: string
  medicalIcon?: LucideIcon
  aiSuggestions?: string[]
  showAISuggestions?: boolean
  medicalContext?: 'symptom' | 'diagnosis' | 'medication' | 'general'
}
