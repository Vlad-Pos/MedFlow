import { NavLink } from 'react-router-dom'
import logoUrl from '../assets/medflow-logo.svg'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="mb-4 flex items-center gap-2 px-2">
        <img src={logoUrl} alt="MedFlow" className="h-6 w-6" />
        <span className="text-lg font-semibold">MedFlow</span>
      </div>
      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" className={({isActive}) => `rounded-lg px-3 py-2 hover:bg-white/5 ${isActive ? 'bg-white/10 text-[var(--medflow-primary)]' : ''}`}>Tablou de bord</NavLink>
        <NavLink to="/appointments" className={({isActive}) => `rounded-lg px-3 py-2 hover:bg-white/5 ${isActive ? 'bg-white/10 text-[var(--medflow-primary)]' : ''}`}>Programări</NavLink>
        <NavLink to="/profile" className={({isActive}) => `rounded-lg px-3 py-2 hover:bg-white/5 ${isActive ? 'bg-white/10 text-[var(--medflow-primary)]' : ''}`}>Profil</NavLink>
        <NavLink to="/chatbot" className={({isActive}) => `rounded-lg px-3 py-2 hover:bg-white/5 ${isActive ? 'bg-white/10 text-[var(--medflow-primary)]' : ''}`}>Chat pacient</NavLink>
        <NavLink to="/ai" className={({isActive}) => `rounded-lg px-3 py-2 hover:bg-white/5 ${isActive ? 'bg-white/10 text-[var(--medflow-primary)]' : ''}`}>Asistent AI</NavLink>
      </nav>
    </aside>
  )
}