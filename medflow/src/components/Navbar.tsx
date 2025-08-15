import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut
} from 'lucide-react'
import medflowLogo from '../assets/medflow-logo.svg'
import { useNavigationItemsV3 } from './navigation/NavigationManagerV3'
import type { NavigationItems } from './navigation/types'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  // Get navigation items based on user role - memoized for performance
  const navItems: NavigationItems = useNavigationItemsV3()
  
  // Memoized theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setDark(v => !v)
  }, [])

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/signin')
    setOpen(false)
  }, [logout, navigate])

  // Memoized mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setOpen(o => !o)
  }, [])

  // Memoized mobile menu close
  const closeMobileMenu = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  // Memoized logo section to prevent unnecessary re-renders
  const logoSection = useMemo(() => (
    <Link 
      to="/" 
      className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2 rounded-lg p-1"
      aria-label="MedFlow - Pagina principală"
    >
      {/* Logo container - DO NOT CHANGE SIZE OR POSITION */}
      <div 
        className="relative h-10 w-10 md:h-11 md:w-11 overflow-hidden" 
        style={{ marginTop: '-2px' }}
      >
        {/* Default: original SVG colors - DO NOT CHANGE */}
        <img
          src={medflowLogo}
          alt="Logo MedFlow"
          className="h-full w-full"
        />
        {/* Hover: blue→purple gradient overlay - DO NOT CHANGE GRADIENT DIRECTION */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
          style={{
            WebkitMaskImage: `url(${medflowLogo})`,
            maskImage: `url(${medflowLogo})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            background: 'linear-gradient(90deg, var(--medflow-brand-2) 0%, var(--medflow-brand-3) 100%)',
          }}
        />
      </div>
      {/* Text container - DO NOT CHANGE SIZE OR COLORS */}
      <span 
        className="text-2xl md:text-3xl font-bold transition-all duration-300 ease-in-out relative"
      >
        {/* Default text color - MUST match logo color */}
        <span 
          className="transition-opacity duration-300 ease-in-out group-hover:opacity-0"
          style={{ color: 'var(--medflow-brand-1)' }}
        >
          MedFlow
        </span>
        {/* Gradient text overlay - purple→blue (INVERTED from logo) - DO NOT CHANGE */}
        <span 
          className="absolute inset-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
          style={{
            backgroundImage: 'linear-gradient(90deg, var(--medflow-brand-3) 0%, var(--medflow-brand-2) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          MedFlow
        </span>
      </span>
    </Link>
  ), [])

  // Memoized desktop navigation
  const desktopNavigation = useMemo(() => (
    <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Navigare principală">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2 ${
              isActive 
                ? 'bg-[var(--medflow-brand-1)]/20 text-[var(--medflow-brand-1)]' 
                : 'text-[var(--medflow-text-muted)] hover:text-[var(--medflow-text-primary)] hover:bg-white/5'
            }`
          }
          aria-label={`${item.label} - ${item.description}`}
        >
          <item.icon className="w-4 h-4" aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  ), [navItems])

  // Memoized desktop actions
  const desktopActions = useMemo(() => (
    <div className="hidden items-center gap-3 md:flex">
      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleThemeToggle}
        className="p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2"
        aria-label={dark ? 'Comută la modul deschis' : 'Comută la modul întunecat'}
        aria-pressed={dark}
      >
        {dark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
      </motion.button>

      {user ? (
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Delogare din cont"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Delogare</span>
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link 
            className="px-4 py-2 text-[var(--medflow-text-muted)] hover:text-[var(--medflow-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2 rounded-lg" 
            to="/signin"
            aria-label="Autentificare în cont"
          >
            Autentificare
          </Link>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              className="px-4 py-2 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2" 
              to="/signup"
              aria-label="Creează cont nou"
            >
              Înregistrare
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  ), [user, dark, handleThemeToggle, handleLogout])

  // Memoized mobile navigation items
  const mobileNavigationItems = useMemo(() => (
    navItems.map((item, index) => (
      <motion.div
        key={item.to}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <NavLink
          to={item.to}
          onClick={closeMobileMenu}
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2 ${
              isActive 
                ? 'bg-[var(--medflow-brand-1)]/20 text-[var(--medflow-brand-1)]' 
                : 'text-[var(--medflow-text-muted)] hover:text-[var(--medflow-text-primary)] hover:bg-white/5'
            }`
          }
          aria-label={`${item.label} - ${item.description}`}
        >
          <item.icon className="w-5 h-5" aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      </motion.div>
    ))
  ), [navItems, closeMobileMenu])

  return (
    <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md"
        style={{ 
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(16, 11, 26, 0.95))'
        }}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {logoSection}

          {desktopNavigation}

          {desktopActions}

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2"
            onClick={toggleMobileMenu}
            aria-label={open ? 'Închide meniul' : 'Deschide meniul'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 bg-[var(--medflow-brand-6)]/95 backdrop-blur-md md:hidden overflow-hidden"
              id="mobile-menu"
              role="navigation"
              aria-label="Meniul mobil"
            >
              <div className="px-4 py-4 space-y-2">
                {mobileNavigationItems}
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-[var(--medflow-text-muted)]">Temă</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleThemeToggle}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2"
                      aria-label={dark ? 'Comută la modul deschis' : 'Comută la modul întunecat'}
                      aria-pressed={dark}
                    >
                      {dark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
                    </motion.button>
                  </div>
                  
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-3 mt-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Delogare din cont"
                    >
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                      <span>Delogare</span>
                    </motion.button>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      <Link 
                        className="px-3 py-3 text-[var(--medflow-text-muted)] hover:text-[var(--medflow-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2 rounded-lg" 
                        to="/signin"
                        onClick={closeMobileMenu}
                        aria-label="Autentificare în cont"
                      >
                        Autentificare
                      </Link>
                      <Link 
                        className="px-3 py-3 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] transition-colors text-center focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2" 
                        to="/signup"
                        onClick={closeMobileMenu}
                        aria-label="Creează cont nou"
                      >
                        Înregistrare
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    )
}