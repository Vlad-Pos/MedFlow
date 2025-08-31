/**
 * New SignIn Component for MedFlow
 * 
 * Features:
 * - Modern shadcn/ui design system
 * - React Hook Form with Zod validation
 * - Integration with existing MedFlow AuthProvider
 * - Romanian error messages for medical professionals
 * - Social authentication placeholders
 * - Responsive design with MedFlow branding
 * 
 * @author MedFlow Team
 * @version 3.0
 */

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Github, Mail, LogIn, AlertTriangle } from 'lucide-react'

import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  validateSignInForm, 
  checkAuthRateLimit, 
  clearAuthRateLimit,
  sanitizeAuthInput
} from '../../utils/authValidation'

// Validation schema with Romanian error messages
const signInSchema = z.object({
  email: z.string()
    .min(1, 'Adresa de email este obligatorie')
    .email('Vă rugăm să introduceți o adresă de email validă'),
  password: z.string()
    .min(1, 'Parola este obligatorie')
    .min(6, 'Parola trebuie să aibă cel puțin 6 caractere'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function NewSignIn() {
  // Hooks
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // State management
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  
  // Navigation configuration
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'
  
  // Form setup
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  
  // Form handlers
  const handleInputChange = useCallback((field: keyof SignInFormData) => (value: string) => {
    const sanitizedValue = sanitizeAuthInput(value)
    form.setValue(field, sanitizedValue)
    
    // Clear errors when user starts typing
    if (error) setError(null)
    if (rateLimited) setRateLimited(false)
  }, [error, rateLimited, form])
  
  /**
   * Enhanced form submission with comprehensive validation and error handling
   */
  const onSubmit = async (data: SignInFormData) => {
    // Rate limiting check
    const rateLimitKey = data.email || 'anonymous'
    if (!checkAuthRateLimit(rateLimitKey)) {
      setRateLimited(true)
      setError('Prea multe încercări de autentificare. Vă rugăm să așteptați 15 minute înainte de a încerca din nou.')
      return
    }
    
    // Validate form data using MedFlow's existing validation
    const validation = validateSignInForm({
      email: data.email,
      password: data.password
    })
    
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await signIn(data.email.trim(), data.password)
      
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
  
  const handleSocialSignIn = (provider: string) => {
    // Placeholder for future social authentication
    setError(`${provider} autentificarea va fi implementată în viitor.`)
  }
  
  const handleForgotPassword = () => {
    navigate('/reset')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Bine ați revenit</h1>
            <p className="text-gray-300">
              Conectați-vă la contul dvs. pentru a continua
            </p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Social Authentication */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignIn("Google")}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignIn("GitHub")}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">sau continuați cu email</span>
              </div>
            </div>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <input
                {...form.register('email')}
                type="email"
                id="email"
                placeholder="Introduceți adresa de email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => handleInputChange('email')(e.target.value)}
              />
              {form.formState.errors.email && (
                <p className="text-red-400 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white">
                Parolă
              </label>
              <div className="relative">
                <input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Introduceți parola"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  onChange={(e) => handleInputChange('password')(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-400 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ați uitat parola?
              </button>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Se conectează...</span>
                </div>
              ) : (
                'Conectare'
              )}
            </button>
            
            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Nu aveți un cont?{' '}
                <Link 
                  to="/new-signup" 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Înregistrați-vă
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
