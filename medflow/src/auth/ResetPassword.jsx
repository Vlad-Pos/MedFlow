import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'
import { authErrorToRoMessage } from '../utils/firebaseErrors'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email) { setError('Introduceți adresa de email.'); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      navigate('/signin', { replace: true, state: { msg: 'Email de resetare trimis.' } })
    } catch (e) {
      setError(authErrorToRoMessage(e?.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Resetare parolă</h2>
      <form className="card space-y-4" onSubmit={handleSubmit}>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Se trimite...' : 'Trimite link resetare'}</button>
        <div className="text-sm"><Link className="link" to="/signin">Înapoi la autentificare</Link></div>
      </form>
    </div>
  )
}