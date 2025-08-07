import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const successMsg = location.state?.msg

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Completați emailul și parola.')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError('Autentificare nereușită. Verifică adresa de email și parola.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Autentificare</h2>
      {successMsg && (
        <div className="mb-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20">{successMsg}</div>
      )}
      <form className="card space-y-4" onSubmit={handleSubmit}>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Parolă</label>
          <input className="input" type="password" placeholder="Parolă" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Se autentifică...' : 'Autentificare'}</button>
        <div className="flex justify-between text-sm">
          <Link className="link" to="/reset">Ai uitat parola?</Link>
          <Link className="link" to="/signup">Creează cont</Link>
        </div>
      </form>
    </div>
  )
}