/**
 * Enhanced SignIn Component for MedFlow
 * 
 * Features:
 * - Comprehensive input validation with Romanian error messages
 * - Real-time validation feedback
 * - Enhanced security with rate limiting
 * - Smooth loading states and animations
 * - Full accessibility support
 * - MedFlow branding and professional styling
 * - AI integration placeholders for future enhancements
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, LogIn } from 'lucide-react'

import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'
import ValidatedInput from '../../components/auth/ValidatedInput'
import { 
  validateSignInForm, 
  checkAuthRateLimit, 
  clearAuthRateLimit,
  sanitizeAuthInput
} from '../../utils/authValidation'

export default function SignIn() {
  // Hooks
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  
  // Navigation configuration
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'
  
  // Form handlers
  const handleInputChange = useCallback((field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: sanitizeAuthInput(value)
    }))
    // Clear errors when user starts typing
    if (error) setError(null)
    if (rateLimited) setRateLimited(false)
  }, [error, rateLimited])
  
  /**
   * Enhanced form submission with comprehensive validation and error handling
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Rate limiting check
    const rateLimitKey = formData.email || 'anonymous'
    if (!checkAuthRateLimit(rateLimitKey)) {
      setRateLimited(true)
      setError('Prea multe încercări de autentificare. Vă rugăm să așteptați 15 minute înainte de a încerca din nou.')
      return
    }
    
    // Validate form data
    const validation = validateSignInForm(formData)
    if (!validation.isValid) {
      setError(validation.errors[0]) // Show first error
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await signIn(formData.email.trim(), formData.password)
      
      // Clear rate limit on successful authentication
      clearAuthRateLimit(rateLimitKey)
      
      // Navigate to intended destination
      navigate(from, { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Autentificare eșuată. Verificați datele introduse și încercați din nou.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // Validation functions for real-time feedback
  const validateEmail = useCallback((email: string) => {
    if (!email.trim()) return { isValid: true, errors: [] }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      isValid: emailRegex.test(email),
      errors: emailRegex.test(email) ? [] : ['Formatul email-ului nu este valid']
    }
  }, [])
  
  const validatePassword = useCallback((password: string) => {
    if (!password.trim()) return { isValid: true, errors: [] }
    return {
      isValid: password.length > 0,
      errors: password.length > 0 ? [] : ['Parola este obligatorie']
    }
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-md"
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
            <Shield className="h-8 w-8 text-medflow-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-medflow-text-primary">
              Autentificare
            </h1>
            <p className="text-sm text-medflow-text-secondary mt-1">
              Accesați platforma MedFlow
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
          🤖 Asistență AI pentru autentificare va fi disponibilă în curând
        </motion.div>
      </motion.div>

      {/* Authentication Form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card space-y-6 bg-medflow-surface/95 backdrop-blur-sm shadow-xl border border-white/10" 
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
                  ? 'bg-orange-500/20 border border-orange-400/30' 
                  : 'bg-red-500/20 border border-red-400/30'
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
                  ? 'text-orange-200' 
                  : 'text-red-200'
              }`}>
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Input */}
        <ValidatedInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          validateFn={validateEmail}
          label="Adresa de email"
          placeholder="medic@exemple.ro"
          autoComplete="email"
          icon="email"
          required
          disabled={loading || rateLimited}
          aiSuggestions={true}
          ariaLabel="Introduceți adresa de email pentru autentificare"
        />

        {/* Password Input */}
        <ValidatedInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          validateFn={validatePassword}
          label="Parola"
          placeholder="Introduceți parola"
          autoComplete="current-password"
          icon="lock"
          showToggle={true}
          required
          disabled={loading || rateLimited}
          ariaLabel="Introduceți parola pentru autentificare"
        />

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || rateLimited}
          className="w-full bg-medflow-accent hover:bg-medflow-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <LoadingSpinner 
              size="sm" 
              text="Se autentifică..." 
              className="text-white"
            />
          ) : (
            <>
              <LogIn className="h-5 w-5" aria-hidden="true" />
              <span>Autentificare</span>
            </>
          )}
        </motion.button>

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-sm border-t border-white/10 pt-4"
        >
          <Link 
            to="/reset" 
            className="text-medflow-accent hover:text-medflow-accent-hover transition-colors duration-200 font-medium"
          >
            Am uitat parola
          </Link>
          <div className="flex items-center space-x-2 text-medflow-text-secondary">
            <span>Nu aveți cont?</span>
            <Link 
              to="/signup" 
              className="text-medflow-accent hover:text-medflow-accent-hover transition-colors duration-200 font-medium"
            >
              Înregistrați-vă
            </Link>
          </div>
        </motion.div>
      </motion.form>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-xs text-medflow-text-muted"
      >
        <p>Conexiunea este securizată și datele sunt protejate conform GDPR</p>
      </motion.div>
    </motion.div>
  )
}