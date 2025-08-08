import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    
    // Basic validation
    if (!email.trim()) {
      setError('Vă rugăm să introduceți adresa de email.')
      setLoading(false)
      return
    }
    
    try {
      await resetPassword(email.trim())
      setMessage('Email de resetare trimis. Verificați căsuța poștală.')
      setEmail('') // Clear email after successful submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nu s-a putut trimite emailul de resetare.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Resetare parolă</h2>
      <form className="card space-y-4" onSubmit={handleSubmit}>
        {message && <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20">{message}</div>}
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input 
            className="input" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={loading}
            autoComplete="email"
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <LoadingSpinner text="Se trimite..." /> : 'Trimite link resetare'}
        </button>
        <div className="text-sm">
          <Link to="/signin" className="link">Înapoi la autentificare</Link>
        </div>
      </form>
    </div>
  )
}