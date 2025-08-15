/**
 * Enhanced ResetPassword Component for MedFlow
 * 
 * Features:
 * - Comprehensive email validation with Romanian error messages
 * - Professional medical styling and branding
 * - Enhanced security with rate limiting
 * - Clear success/error feedback
 * - Smooth animations and loading states
 * - Full accessibility support
 * - AI integration placeholders for future enhancements
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Mail, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'

import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'
import ValidatedInput from '../../components/auth/ValidatedInput'
import { 
  validateEmail,
  checkAuthRateLimit,
  sanitizeAuthInput
} from '../../utils/authValidation'
export default function ResetPassword() {
  // Hooks
  const { resetPassword } = useAuth()
  
  // State management
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  
  // Form handlers
  const handleEmailChange = useCallback((value: string) => {
    setEmail(sanitizeAuthInput(value))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (message) setMessage(null)
    if (rateLimited) setRateLimited(false)
  }, [error, message, rateLimited])
  
  /**
   * Enhanced form submission with comprehensive validation and error handling
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Rate limiting check
    const rateLimitKey = email || 'anonymous'
    if (!checkAuthRateLimit(rateLimitKey, 3)) { // Lower limit for password reset
      setRateLimited(true)
      setError('Prea multe cereri de resetare. Vă rugăm să așteptați 15 minute înainte de a încerca din nou.')
      return
    }
    
    // Validate email
    const validation = validateEmail(email)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      await resetPassword(email.trim())
      setMessage('Link-ul de resetare a fost trimis cu succes! Verificați emailul și dosarul spam.')
      setEmail('') // Clear email after successful submission
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Nu s-a putut trimite emailul de resetare. Vă rugăm să încercați din nou.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
            <KeyRound className="h-8 w-8 text-medflow-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-medflow-text-primary">
              Resetare parolă
            </h1>
            <p className="text-sm text-medflow-text-secondary mt-1">
              Recuperați accesul la contul MedFlow
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
          🤖 Asistență AI pentru recuperarea contului va fi disponibilă în curând
        </motion.div>
      </motion.div>

      {/* Reset Password Form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card space-y-6 bg-medflow-surface/95 backdrop-blur-sm shadow-xl border border-white/10" 
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Success Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3 p-4 rounded-lg bg-emerald-500/20 border border-emerald-400/30"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle 
                className="h-5 w-5 flex-shrink-0 text-emerald-600" 
                aria-hidden="true" 
              />
              <div className="text-sm text-emerald-200">
                <p className="font-medium mb-1">Email trimis cu succes!</p>
                <p className="text-xs">{message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
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

        {/* Information Box */}
        {!message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Cum funcționează resetarea</p>
                <p className="text-xs leading-relaxed">
                  Introduceți emailul asociat contului MedFlow. Veți primi un link securizat 
                  pentru resetarea parolei. Link-ul este valabil 1 oră din motive de securitate.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Input */}
        {!message && (
          <ValidatedInput
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            validateFn={(email) => {
              if (!email.trim()) return { isValid: true, errors: [] }
              return validateEmail(email)
            }}
            label="Adresa de email"
            placeholder="medic@exemple.ro"
            autoComplete="email"
            icon="email"
            required
            disabled={loading || rateLimited}
            aiSuggestions={true}
            ariaLabel="Introduceți adresa de email pentru resetarea parolei"
          />
        )}

        {/* Submit Button */}
        {!message && (
          <motion.button
            type="submit"
            disabled={loading || rateLimited || !email.trim()}
            className="w-full bg-medflow-accent hover:bg-medflow-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <LoadingSpinner 
                size="sm" 
                text="Se trimite emailul..." 
                className="text-white"
              />
            ) : (
              <>
                <Mail className="h-5 w-5" aria-hidden="true" />
                <span>Trimite link resetare</span>
              </>
            )}
          </motion.button>
        )}

        {/* Success Actions */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <motion.button
              type="button"
              onClick={() => {
                setMessage(null)
                setEmail('')
              }}
              className="w-full bg-medflow-surface border border-white/20 text-medflow-text-primary hover:bg-medflow-surface-elevated font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              <span>Trimite din nou</span>
            </motion.button>
          </motion.div>
        )}

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm border-t border-white/10 pt-4"
        >
          <Link 
            to="/signin" 
            className="flex items-center space-x-2 text-medflow-accent hover:text-medflow-accent-hover transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Înapoi la autentificare</span>
          </Link>
          <div className="hidden sm:block text-medflow-text-muted">|</div>
          <Link 
            to="/signup" 
            className="text-medflow-text-secondary hover:text-medflow-accent transition-colors duration-200"
          >
            Creează cont nou
          </Link>
        </motion.div>
      </motion.form>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-xs text-medflow-text-muted"
      >
        <p>Link-urile de resetare sunt securizate și expiră automat pentru protecția contului</p>
      </motion.div>
    </motion.div>
    )
}