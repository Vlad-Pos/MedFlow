import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Loader } from 'lucide-react'
export default function EarlyAccessForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Adresa de email este obligatorie')
      return
    }

    setLoading(true)
    setError('')
    
    // Simulate API call - replace with real implementation later
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For now, just show success (future: actual email collection)
      setSubmitted(true)
      setLoading(false)
    } catch (err) {
      setError('A apărut o eroare. Vă rugăm să încercați din nou.')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-green-500/20 border border-green-400/30 rounded-xl"
        >
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-300 mb-2">Înregistrare reușită!</h3>
          <p className="text-green-200 text-sm">
            Vă mulțumim pentru interes! Veți fi contactat când platforma va fi disponibilă pentru testare.
          </p>
        </motion.div>
      )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="Adresa de email profesională"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
            required
          />
        </div>
        
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Se înregistrează...</span>
            </>
          ) : (
            <span>Înregistrează-te pentru accesul timpuriu</span>
          )}
        </motion.button>
        
        <p className="text-xs text-gray-500 text-center">
          Prin înregistrare, acceptați să fiți contactat cu actualizări despre platforma MedFlow.
          Nu vom partaja datele dumneavoastră cu terțe părți.
        </p>
      </form>
    )
}
