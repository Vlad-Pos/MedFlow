import { SelectProps } from '../../core/Select/Select.types'
import { LucideIcon } from 'lucide-react'

export type MedicalSelectVariant = 'default' | 'outlined' | 'filled' | 'medical'
export type MedicalSelectState = 'default' | 'error' | 'success' | 'warning'

export interface MedicalSelectProps extends Omit<SelectProps, 'variant'> {
  variant?: MedicalSelectVariant
  warning?: string
  medicalIcon?: LucideIcon
  medicalContext?: 'status' | 'category' | 'priority' | 'general'
}
