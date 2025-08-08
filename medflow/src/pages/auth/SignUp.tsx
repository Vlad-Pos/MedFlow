import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SignUp() {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'doctor' | 'nurse'>('doctor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Basic validation
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vă rugăm să completați toate câmpurile.')
      setLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.')
      setLoading(false)
      return
    }
    
    if (password !== confirmPassword) {
      setError('Parolele nu se potrivesc.')
      setLoading(false)
      return
    }
    
    try {
      await signUp(email.trim(), password, displayName.trim(), role)
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Crearea contului a eșuat. Încercați din nou.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Creează cont</h2>
      <form className="card space-y-4" onSubmit={handleSubmit}>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
        <div>
          <label className="label">Nume afișat</label>
          <input 
            className="input" 
            value={displayName} 
            onChange={e => setDisplayName(e.target.value)} 
            required 
            disabled={loading}
            autoComplete="name"
          />
        </div>
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
        <div>
          <label className="label">Parolă</label>
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={loading}
            autoComplete="new-password"
            minLength={6}
          />
        </div>
        <div>
          <label className="label">Confirmă parola</label>
          <input 
            className="input" 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label">Rol</label>
          <select 
            className="input" 
            value={role} 
            onChange={e => setRole(e.target.value as 'doctor' | 'nurse')}
            disabled={loading}
          >
            <option value="doctor">Doctor</option>
            <option value="nurse">Asistent</option>
          </select>
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <LoadingSpinner text="Se creează contul..." /> : 'Înscrie-te'}
        </button>
        <div className="text-sm">
          Ai deja cont? <Link to="/signin" className="link">Autentifică-te</Link>
        </div>
      </form>
    </div>
  )
}