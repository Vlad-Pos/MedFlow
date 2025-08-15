import { ButtonProps } from '../../core/Button/Button.types'
import { LucideIcon } from 'lucide-react'

export type MedicalButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'medical' | 'emergency'

export interface MedicalButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: MedicalButtonVariant
  medicalIcon?: LucideIcon
  showMedicalBadge?: boolean
  medicalContext?: 'appointment' | 'patient' | 'emergency' | 'routine'
}
