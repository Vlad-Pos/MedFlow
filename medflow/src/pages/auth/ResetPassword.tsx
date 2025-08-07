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
    try {
      await resetPassword(email)
      setMessage('Email de resetare trimis. Verificați căsuța poștală.')
    } catch (err: any) {
      setError('Nu s-a putut trimite emailul de resetare.')
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
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <LoadingSpinner label="Se trimite..." /> : 'Trimite link resetare'}
        </button>
        <div className="text-sm">
          <Link to="/signin" className="link">Înapoi la autentificare</Link>
        </div>
      </form>
    </div>
  )
}