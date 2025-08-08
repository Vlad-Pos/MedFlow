import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { saveUserToFirestore } from '../firebase/firebase'
import { Link, useNavigate } from 'react-router-dom'
import { authErrorToRoMessage } from '../utils/firebaseErrors'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password || !confirm) {
      setError('Completați toate câmpurile.')
      return
    }
    if (password !== confirm) {
      setError('Parolele nu coincid.')
      return
    }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await updateProfile(cred.user, { displayName: name })
      }
      await saveUserToFirestore(cred.user, 'doctor')
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(authErrorToRoMessage(e?.code))
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
          <label className="label">Nume</label>
          <input className="input" placeholder="Nume (opțional)" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Parolă</label>
          <input className="input" type="password" placeholder="Parolă" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Confirmă parola</label>
          <input className="input" type="password" placeholder="Confirmă parola" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Se creează...' : 'Creează cont'}</button>
        <div className="text-sm">Ai deja cont? <Link className="link" to="/signin">Autentifică-te</Link></div>
      </form>
    </div>
  )
}