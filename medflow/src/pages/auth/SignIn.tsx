import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function SignIn() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError('Autentificare eșuată. Verificați emailul și parola.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Autentificare</h2>
      <form className="card space-y-4" onSubmit={handleSubmit}>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Parolă</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <LoadingSpinner label="Se autentifică..." /> : 'Autentificare'}
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/reset" className="link">Am uitat parola</Link>
          <Link to="/signup" className="link">Creează cont</Link>
        </div>
      </form>
    </div>
  )
}