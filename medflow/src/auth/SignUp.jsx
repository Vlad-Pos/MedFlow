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
  const [errorDetails, setErrorDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setErrorDetails('')

    // Basic client-side validation
    if (!email || !password || !confirm) {
      setError('Completați toate câmpurile.')
      return
    }
    if (password !== confirm) {
      setError('Parolele nu coincid.')
      return
    }

    setLoading(true)
    console.log('[SignUp] Începe înregistrarea utilizatorului', { email })
    try {
      // Create Firebase user account
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      console.log('[SignUp] Cont creat cu succes', { uid: cred.user?.uid })

      // Optional display name
      if (name) {
        await updateProfile(cred.user, { displayName: name })
        console.log('[SignUp] Nume afișat setat')
      }

      // Persist role/user record in Firestore (default: doctor)
      await saveUserToFirestore(cred.user, 'doctor')
      console.log('[SignUp] Utilizator salvat în Firestore')

      // Redirect to dashboard
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error('[SignUp] Eroare la înregistrare', e)
      // Map known Firebase errors to Romanian
      setError(authErrorToRoMessage(e?.code))
      // Optional small details for debugging (non-sensitive)
      setErrorDetails(e?.code ? `Detalii: ${e.code}` : '')
    } finally {
      setLoading(false)
      console.log('[SignUp] Finalizat')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-6 text-2xl font-semibold">Creează cont</h2>
      <form className="card space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">
            {error}
            {errorDetails && <div className="mt-1 text-xs opacity-80">{errorDetails}</div>}
          </div>
        )}
        <div>
          <label className="label">Nume</label>
          <input
            className="input"
            placeholder="Nume (opțional)"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Parolă</label>
          <input
            className="input"
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Confirmă parola</label>
          <input
            className="input"
            type="password"
            placeholder="Confirmă parola"
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
            disabled={loading}
          />
        </div>
        <button className="btn-primary w-full disabled:cursor-not-allowed" disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="spinner" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              Se creează...
            </span>
          ) : 'Creează cont'}
        </button>
        <div className="text-sm">Ai deja cont? <Link className="link" to="/signin">Autentifică-te</Link></div>
      </form>
    </div>
  )
}