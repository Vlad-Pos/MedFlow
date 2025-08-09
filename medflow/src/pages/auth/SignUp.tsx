/**
 * Enhanced SignUp Component for MedFlow
 * 
 * Features:
 * - Comprehensive form validation with Romanian error messages
 * - Real-time password strength indicator
 * - Professional role selection for medical practitioners
 * - Enhanced security with input sanitization
 * - Smooth animations and loading states
 * - Full accessibility support
 * - MedFlow branding and medical professional styling
 * - AI integration placeholders for future enhancements
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, AlertTriangle, Shield, Stethoscope } from 'lucide-react'

import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'
import ValidatedInput from '../../components/auth/ValidatedInput'
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator'
import { 
  validateSignUpForm,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateRole,
  checkAuthRateLimit,
  clearAuthRateLimit,
  sanitizeAuthInput
} from '../../utils/authValidation'

export default function SignUp() {
  // Hooks
  const { signUp } = useAuth()
  const navigate = useNavigate()
  
  // State management
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'doctor' | 'nurse' | ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)
  
  // Form handlers
  const handleInputChange = useCallback((field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'role' ? value : sanitizeAuthInput(value)
    }))
    
    // Show password strength when user starts typing password
    if (field === 'password' && value.length > 0) {
      setShowPasswordStrength(true)
    } else if (field === 'password' && value.length === 0) {
      setShowPasswordStrength(false)
    }
    
    // Clear errors when user starts typing
    if (error) setError(null)
    if (rateLimited) setRateLimited(false)
  }, [error, rateLimited])
  
  /**
   * Enhanced form submission with comprehensive validation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Rate limiting check
    const rateLimitKey = formData.email || 'anonymous'
    if (!checkAuthRateLimit(rateLimitKey)) {
      setRateLimited(true)
      setError('Prea multe încercări de înregistrare. Vă rugăm să așteptați 15 minute înainte de a încerca din nou.')
      return
    }
    
    // Comprehensive form validation
    const validation = validateSignUpForm(formData)
    if (!validation.isValid) {
      setError(validation.errors[0]) // Show first error
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await signUp(
        formData.email.trim(), 
        formData.password, 
        formData.displayName.trim(), 
        formData.role
      )
      
      // Clear rate limit on successful registration
      clearAuthRateLimit(rateLimitKey)
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Crearea contului a eșuat. Vă rugăm să încercați din nou.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // Role options for medical professionals
  const roleOptions = [
    { value: 'doctor', label: 'Doctor - Medic specialist/primar' },
    { value: 'nurse', label: 'Asistent medical - Infirmier/ă' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-lg"
    >
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-medflow-primary/10 rounded-full">
            <Stethoscope className="h-8 w-8 text-medflow-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Înregistrare MedFlow
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Creați un cont pentru accesul la platformă
            </p>
          </div>
        </div>
        
        {/* AI Integration Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-medflow-primary/70 bg-medflow-primary/5 p-2 rounded-lg border border-medflow-primary/10"
        >
          🤖 Asistență AI pentru completarea formularului va fi disponibilă în curând
        </motion.div>
      </motion.div>

      {/* Registration Form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card space-y-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl border border-medflow-primary/10" 
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center space-x-3 p-4 rounded-lg ${
                rateLimited 
                  ? 'bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' 
                  : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              <AlertTriangle 
                className={`h-5 w-5 flex-shrink-0 ${
                  rateLimited ? 'text-orange-600' : 'text-red-600'
                }`} 
                aria-hidden="true" 
              />
              <span className={`text-sm font-medium ${
                rateLimited 
                  ? 'text-orange-800 dark:text-orange-300' 
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Name Input */}
        <ValidatedInput
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleInputChange('displayName')}
          validateFn={validateDisplayName}
          label="Nume complet"
          placeholder="Dr. Ion Popescu / Asist. Maria Ionescu"
          autoComplete="name"
          icon="user"
          required
          disabled={loading || rateLimited}
          aiSuggestions={true}
          ariaLabel="Introduceți numele complet pentru identificare profesională"
        />

        {/* Email Input */}
        <ValidatedInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          validateFn={validateEmail}
          label="Adresa de email"
          placeholder="medic@cabinet.ro"
          autoComplete="email"
          icon="email"
          required
          disabled={loading || rateLimited}
          aiSuggestions={true}
          ariaLabel="Introduceți adresa de email pentru autentificare"
        />

        {/* Professional Role Selection */}
        <ValidatedInput
          type="select"
          name="role"
          value={formData.role}
          onChange={handleInputChange('role')}
          validateFn={validateRole}
          label="Calificarea profesională"
          placeholder="Selectați calificarea dvs."
          options={roleOptions}
          icon="role"
          required
          disabled={loading || rateLimited}
          ariaLabel="Selectați calificarea profesională medicală"
        />

        {/* Password Input */}
        <div className="space-y-3">
          <ValidatedInput
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            validateFn={(password) => validatePassword(password)}
            label="Parola"
            placeholder="Alegeți o parolă sigură"
            autoComplete="new-password"
            icon="lock"
            showToggle={true}
            required
            disabled={loading || rateLimited}
            ariaLabel="Alegeți o parolă sigură pentru cont"
          />
          
          {/* Password Strength Indicator */}
          <AnimatePresence>
            {showPasswordStrength && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PasswordStrengthIndicator 
                  password={formData.password}
                  showRequirements={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password Input */}
        <ValidatedInput
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          validateFn={(confirmPassword) => validatePassword(formData.password, confirmPassword)}
          label="Confirmați parola"
          placeholder="Introduceți din nou parola"
          autoComplete="new-password"
          icon="lock"
          showToggle={true}
          required
          disabled={loading || rateLimited}
          ariaLabel="Confirmați parola introdusă anterior"
        />

        {/* Terms and Conditions Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-medflow-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-1">Protecția datelor medicale</p>
              <p className="text-xs leading-relaxed">
                Prin crearea contului, confirmați că sunteți un profesionist medical autorizat 
                și acceptați <Link to="/terms" className="text-medflow-primary hover:underline">Termenii și Condițiile</Link> 
                {' '}și <Link to="/privacy" className="text-medflow-primary hover:underline">Politica de Confidențialitate</Link> 
                {' '}conform GDPR.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || rateLimited}
          className="w-full bg-medflow-primary hover:bg-medflow-secondary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <LoadingSpinner 
              size="sm" 
              text="Se creează contul..." 
              className="text-white"
            />
          ) : (
            <>
              <UserPlus className="h-5 w-5" aria-hidden="true" />
              <span>Creează cont MedFlow</span>
            </>
          )}
        </motion.button>

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Aveți deja cont?</span>
            <Link 
              to="/signin" 
              className="text-medflow-primary hover:text-medflow-secondary transition-colors duration-200 font-medium"
            >
              Autentificați-vă
            </Link>
          </div>
        </motion.div>
      </motion.form>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
      >
        <p>Datele sunt criptate și protejate conform standardelor medicale și GDPR</p>
      </motion.div>
    </motion.div>
  )
}