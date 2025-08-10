/**
 * Password Strength Indicator Component for MedFlow
 * 
 * Provides real-time visual feedback on password strength with:
 * - Color-coded strength levels
 * - Romanian feedback messages
 * - Professional medical UI styling
 * - Accessibility features
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { analyzePasswordStrength, type PasswordStrength } from '../../utils/authValidation'
import DesignWorkWrapper from '../../../DesignWorkWrapper'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
  className?: string
}

// Color schemes for different strength levels with MedFlow branding
const strengthColors = {
  0: { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700' },
  1: { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700' },
  2: { bg: 'bg-orange-100', bar: 'bg-orange-500', text: 'text-orange-700' },
  3: { bg: 'bg-medflow-primary/10', bar: 'bg-medflow-primary', text: 'text-medflow-primary' },
  4: { bg: 'bg-emerald-100', bar: 'bg-emerald-500', text: 'text-emerald-700' },
  5: { bg: 'bg-emerald-100', bar: 'bg-emerald-600', text: 'text-emerald-800' }
}

// Requirement labels in Romanian
const requirementLabels = {
  length: 'Cel puțin 8 caractere',
  uppercase: 'Litere mari (A-Z)',
  lowercase: 'Litere mici (a-z)',
  numbers: 'Cifre (0-9)',
  symbols: 'Simboluri (!@#$%^&*)'
}

export default function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true,
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const strength = analyzePasswordStrength(password)
  const colors = strengthColors[strength.score as keyof typeof strengthColors]
  
  // Don't show anything if password is empty
  if (!password) {
    return null
  }

  return (
    <DesignWorkWrapper componentName="PasswordStrengthIndicator">
      <div className={`space-y-3 ${className}`} role="region" aria-label="Indicarea puterii parolei">
        {/* Strength bar and feedback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Puterea parolei:</span>
            <span className={`font-medium ${colors.text}`}>
              {getStrengthLabel(strength.score)}
            </span>
          </div>
          
          {/* Visual strength bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${colors.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${(strength.score / 5) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          
          {/* Feedback message */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xs ${colors.text}`}
          >
            {strength.feedback}
          </motion.p>
        </div>

        {/* Requirements checklist */}
        {showRequirements && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cerințe parolă:
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {Object.entries(strength.requirements).map(([key, met]) => (
                <RequirementItem
                  key={key}
                  label={requirementLabels[key as keyof typeof requirementLabels]}
                  met={met}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DesignWorkWrapper>
  )
}

/**
 * Individual requirement item component
 */
function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {met ? (
        <CheckCircle2 
          className="h-4 w-4 text-emerald-500 flex-shrink-0" 
          aria-hidden="true"
        />
      ) : (
        <XCircle 
          className="h-4 w-4 text-red-500 flex-shrink-0" 
          aria-hidden="true"
        />
      )}
      <span className={`${met ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'} transition-colors`}>
        {label}
      </span>
      <span className="sr-only">
        {met ? 'îndeplinit' : 'neîndeplinit'}
      </span>
    </motion.div>
  )
}

/**
 * Get human-readable strength label
 */
function getStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Foarte slabă'
    case 2:
      return 'Slabă'
    case 3:
      return 'Moderată'
    case 4:
      return 'Puternică'
    case 5:
      return 'Foarte puternică'
    default:
      return 'Necunoscută'
  }
}

/**
 * Compact version for inline use
 */
export function CompactPasswordStrength({ password }: { password: string }) {
  const strength = analyzePasswordStrength(password)
  const colors = strengthColors[strength.score as keyof typeof strengthColors]
  
  if (!password) return null
  
  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className="h-1.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength.score / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className={`${colors.text} font-medium`}>
        {getStrengthLabel(strength.score)}
      </span>
    </div>
  )
}
