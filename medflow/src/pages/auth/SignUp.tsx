import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SignUp() {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'doctor' | 'nurse'>('doctor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signUp(email, password, displayName, role)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Crearea contului a eșuat. Încercați din nou.')
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
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Parolă</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label">Rol</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value as any)}>
            <option value="doctor">Doctor</option>
            <option value="nurse">Asistent</option>
          </select>
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <LoadingSpinner label="Se creează contul..." /> : 'Înscrie-te'}
        </button>
        <div className="text-sm">
          Ai deja cont? <Link to="/signin" className="link">Autentifică-te</Link>
        </div>
      </form>
    </div>
  )
}