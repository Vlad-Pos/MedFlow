/**
 * New SignUp Component for MedFlow
 * 
 * Features:
 * - Modern shadcn/ui design system
 * - React Hook Form with Zod validation
 * - Integration with existing MedFlow AuthProvider
 * - Romanian error messages for medical professionals
 * - Professional role selection for medical practitioners
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
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Github, Mail, UserPlus, AlertTriangle, Stethoscope } from 'lucide-react'

import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'
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
import { LEGACY_ROLE_MAPPING, LEGACY_ROLE_DISPLAY_NAMES, type LegacyUserRole } from '../../types/auth'

// Validation schema with Romanian error messages
const signUpSchema = z.object({
  firstName: z.string()
    .min(1, 'Prenumele este obligatoriu')
    .min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere'),
  lastName: z.string()
    .min(1, 'Numele este obligatoriu')
    .min(2, 'Numele trebuie să aibă cel puțin 2 caractere'),
  email: z.string()
    .min(1, 'Adresa de email este obligatorie')
    .email('Vă rugăm să introduceți o adresă de email validă'),
  password: z.string()
    .min(1, 'Parola este obligatorie')
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere pentru securitate'),
  confirmPassword: z.string()
    .min(1, 'Vă rugăm să confirmați parola'),
  role: z.string()
    .min(1, 'Vă rugăm să selectați un rol')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele introduse nu se potrivesc',
  path: ['confirmPassword'],
}).refine((data) => Object.keys(LEGACY_ROLE_MAPPING).includes(data.role), {
  message: 'Rolul selectat nu este valid',
  path: ['role'],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function NewSignUp() {
  // Hooks
  const { signUp } = useAuth()
  const navigate = useNavigate()
  
  // State management
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  
  // Form setup
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
  })
  
  // Form handlers
  const handleInputChange = useCallback((field: keyof SignUpFormData) => (value: string) => {
    const sanitizedValue = field === 'role' ? value : sanitizeAuthInput(value)
    form.setValue(field, sanitizedValue)
    
    // Clear errors when user starts typing
    if (error) setError(null)
    if (rateLimited) setRateLimited(false)
  }, [error, rateLimited, form])
  
  /**
   * Enhanced form submission with comprehensive validation
   */
  const onSubmit = async (data: SignUpFormData) => {
    // Rate limiting check
    const rateLimitKey = data.email || 'anonymous'
    if (!checkAuthRateLimit(rateLimitKey)) {
      setRateLimited(true)
      setError('Prea multe încercări de înregistrare. Vă rugăm să așteptați 15 minute înainte de a încerca din nou.')
      return
    }
    
    // Comprehensive form validation using MedFlow's existing validation
    const validation = validateSignUpForm({
      displayName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role as LegacyUserRole
    })
    
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    
    // Ensure role is valid before calling signUp
    if (!data.role || !Object.keys(LEGACY_ROLE_MAPPING).includes(data.role)) {
      setError('Rolul selectat nu este valid.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await signUp(data.email.trim(), data.password, `${data.firstName} ${data.lastName}`)
      
      // Clear rate limit on successful registration
      clearAuthRateLimit(rateLimitKey)
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Înregistrarea a eșuat. Vă rugăm să încercați din nou.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSocialSignUp = (provider: string) => {
    // Placeholder for future social authentication
    setError(`${provider} înregistrarea va fi implementată în viitor.`)
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
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Creați un cont</h1>
            <p className="text-gray-300">
              Introduceți detaliile dvs. pentru a crea contul
            </p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Social Authentication */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignUp("Google")}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignUp("GitHub")}
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
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-white">
                  Prenume
                </label>
                <input
                  {...form.register('firstName')}
                  type="text"
                  id="firstName"
                  placeholder="Prenumele dvs."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => handleInputChange('firstName')(e.target.value)}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-400 text-sm">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-white">
                  Nume
                </label>
                <input
                  {...form.register('lastName')}
                  type="text"
                  id="lastName"
                  placeholder="Numele dvs."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => handleInputChange('lastName')(e.target.value)}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-400 text-sm">{form.formState.errors.lastName.message}</p>
                )}
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
            
            {/* Role Selection */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-white flex items-center">
                <Stethoscope className="w-4 h-4 mr-2" />
                Rol profesional
              </label>
              <select
                {...form.register('role')}
                id="role"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => handleInputChange('role')(e.target.value)}
              >
                <option value="">Selectați rolul dvs.</option>
                {Object.entries(LEGACY_ROLE_DISPLAY_NAMES).map(([key, displayName]) => (
                  <option key={key} value={key} className="bg-slate-800 text-white">
                    {displayName}
                  </option>
                ))}
              </select>
              {form.formState.errors.role && (
                <p className="text-red-400 text-sm">{form.formState.errors.role.message}</p>
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
            
            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirmați parola
              </label>
              <div className="relative">
                <input
                  {...form.register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirmați parola"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  onChange={(e) => handleInputChange('confirmPassword')(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-400 text-sm">{form.formState.errors.confirmPassword.message}</p>
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
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Se creează contul...</span>
                </div>
              ) : (
                'Creați contul'
              )}
            </button>
            
            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Aveți deja un cont?{' '}
                <Link 
                  to="/new-signin" 
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Conectați-vă
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
