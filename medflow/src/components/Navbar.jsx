import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import logoUrl from '../assets/medflow-logo.svg'

// Note: Vite supports importing SVGs as URLs out of the box. We import the logo
// as a URL string and use it in an <img> tag to avoid any runtime path issues.
export default function Navbar() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
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

  async function handleLogout() {
    await signOut(auth)
    navigate('/signin', { replace: true })
  }

  const linkCls = ({isActive}) => `${isActive ? 'active-link' : ''} relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--medflow-primary)] after:transition-all hover:after:w-full`;

  return (
    <header className="nav-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-4 text-3xl font-semibold md:text-4xl">
          {/* Using Vite-imported URL for the SVG logo; size and alignment tuned to match text */}
          <img src={logoUrl} alt="MedFlow" className="h-12 w-auto align-middle" />
          MedFlow
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/dashboard" className={linkCls}>Tablou de bord</NavLink>
          <NavLink to="/appointments" className={linkCls}>Programări</NavLink>
          <NavLink to="/profile" className={linkCls}>Profil</NavLink>
          <NavLink to="/ai" className={linkCls}>Asistent AI</NavLink>
          <button className="btn-ghost" onClick={()=>setDark(v=>!v)}>{dark ? 'Luminos' : 'Întunecat'}</button>
          {user ? (
            <button className="btn-primary" onClick={handleLogout}>Delogare</button>
          ) : (
            <div className="flex items-center gap-3">
              <Link className="btn-ghost" to="/signin">Autentificare</Link>
              <Link className="btn-primary" to="/signup">Înregistrare</Link>
            </div>
          )}
        </nav>
        <button className="md:hidden" onClick={()=>setOpen(o=>!o)} aria-label="Deschide meniul">
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
            {user ? (
              <button className="btn-primary" onClick={async ()=>{await handleLogout(); setOpen(false)}}>Delogare</button>
            ) : (
              <>
                <Link className="btn-ghost" to="/signin" onClick={()=>setOpen(false)}>Autentificare</Link>
                <Link className="btn-primary" to="/signup" onClick={()=>setOpen(false)}>Înregistrare</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}