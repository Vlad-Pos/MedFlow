import { Link, NavLink, useNavigate } from 'react-router-dom'
import { memo, useCallback, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import logoUrl from '../assets/medflow-logo.svg'

const prefetchRouteChunk = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/appointments': () => import('../pages/Appointments'),
  '/analytics': () => import('../pages/Analytics'),
  '/profile': () => import('../pages/Profile'),
  '/chatbot': () => import('../components/ChatbotPlaceholder'),
  '/signin': () => import('../auth/SignIn'),
  '/signup': () => import('../auth/SignUp'),
  '/reset': () => import('../auth/ResetPassword'),
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 18a6 6 0 100-12 6 6 0 000 12z"/><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zm0 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V18a.75.75 0 01.75-.75zm9-6a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5H20.25a.75.75 0 01.75.75zm-15 0a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zm11.03-6.78a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM5.66 17.47a.75.75 0 001.06 0l1.06-1.06a.75.75 0 10-1.06-1.06L5.66 16.4a.75.75 0 000 1.06zm12.87 1.06a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM6.72 5.41L5.66 4.35A.75.75 0 014.6 5.41l1.06 1.06a.75.75 0 001.06-1.06z" clipRule="evenodd"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M21.752 15.002A9.718 9.718 0 0112 21.75a9.75 9.75 0 01-9.75-9.75 9.718 9.718 0 016.748-9.252.75.75 0 01.917.935A8.249 8.249 0 0012 20.25a8.249 8.249 0 008.317-6.085.75.75 0 011.435.837z"/>
    </svg>
  )
}

function Navbar() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (!stored) {
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      localStorage.setItem('theme', prefers ? 'dark' : 'light')
      return prefers
    }
    return stored === 'dark'
  })
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u)=> setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) { root.classList.add('dark'); localStorage.setItem('theme','dark') }
    else { root.classList.remove('dark'); localStorage.setItem('theme','light') }
  }, [dark])

  const handleLogout = useCallback(async () => {
    await signOut(auth)
    navigate('/signin', { replace: true })
  }, [navigate])

  const toggleTheme = useCallback(() => setDark(v=>!v), [])

  const activeCls = ({isActive}) => isActive ? 'text-blue-600 underline underline-offset-4' : ''

  const avatar = user ? (user.displayName || user.email || 'U')[0]?.toUpperCase?.() : null

  const prefetch = useCallback((path) => {
    const loader = prefetchRouteChunk[path]
    if (loader) loader()
  }, [])

  return (
    <header className="nav-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-4 text-[2rem] font-semibold leading-none md:text-[2.75rem]">
          <img src={logoUrl} alt="Siglă MedFlow" className="h-[2.5rem] w-auto align-middle md:h-[3rem]" />
          MedFlow
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/dashboard" className={activeCls} onMouseEnter={()=>prefetch('/dashboard')}>Tablou de bord</NavLink>
          <NavLink to="/appointments" className={activeCls} onMouseEnter={()=>prefetch('/appointments')}>Programări</NavLink>
          <NavLink to="/profile" className={activeCls} onMouseEnter={()=>prefetch('/profile')}>Profil</NavLink>
          <NavLink to="/ai" className={activeCls} onMouseEnter={()=>prefetch('/chatbot')}>Asistent AI</NavLink>
          <NavLink to="/analytics" className={activeCls} onMouseEnter={()=>prefetch('/analytics')}>Analitice</NavLink>
          <button
            className="btn-ghost"
            aria-label="Comută tema"
            aria-pressed={dark}
            onClick={toggleTheme}
            title={dark ? 'Comută pe mod luminos' : 'Comută pe mod întunecat'}
          >
            {dark ? <SunIcon/> : <MoonIcon/>}
          </button>
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                {avatar}
              </div>
              <button className="btn-primary" onClick={handleLogout}>Delogare</button>
            </div>
          )}
          {!user && (
            <div className="flex items-center gap-3">
              <NavLink className={activeCls} to="/signin" onMouseEnter={()=>prefetch('/signin')}>Autentificare</NavLink>
              <NavLink className={activeCls} to="/signup" onMouseEnter={()=>prefetch('/signup')}>Înregistrare</NavLink>
            </div>
          )}
        </nav>
        <button className="md:hidden" onClick={()=>setOpen(o=>!o)} aria-label="Deschide meniul" aria-expanded={open}>
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/dashboard" onClick={()=>setOpen(false)}>Tablou de bord</NavLink>
            <NavLink to="/appointments" onClick={()=>setOpen(false)}>Programări</NavLink>
            <NavLink to="/profile" onClick={()=>setOpen(false)}>Profil</NavLink>
            <NavLink to="/ai" onClick={()=>setOpen(false)}>Asistent AI</NavLink>
            <NavLink to="/analytics" onClick={()=>setOpen(false)}>Analitice</NavLink>
            {user ? (
              <button className="btn-primary" onClick={async ()=>{await handleLogout(); setOpen(false)}}>Delogare</button>
            ) : (
              <>
                <NavLink className={activeCls} to="/signin" onClick={()=>setOpen(false)}>Autentificare</NavLink>
                <NavLink className={activeCls} to="/signup" onClick={()=>setOpen(false)}>Înregistrare</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default memo(Navbar)