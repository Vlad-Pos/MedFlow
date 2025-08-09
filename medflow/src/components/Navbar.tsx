import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  Calendar, 
  BarChart3, 
  MessageCircle, 
  LogOut,
  Home,
  FileText,
  CalendarCheck
} from 'lucide-react'
import medflowLogo from '../assets/medflow-logo.svg'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark'
  })

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

  const navItems = [
    { to: '/dashboard', label: 'Tablou de bord', icon: Home, description: 'Vizualizează programările și statisticile' },
    { to: '/appointments', label: 'Programări', icon: Calendar, description: 'Gestionează programările pacienților' },
    { to: '/reports', label: 'Rapoarte medicale', icon: FileText, description: 'Gestionează rapoartele de consultație' },
    { to: '/monthly-review', label: 'Revizuire lunară', icon: CalendarCheck, description: 'Revizuiește și pregătește rapoartele pentru trimitere' },
    { to: '/chatbot', label: 'Chat pacient', icon: MessageCircle, description: 'Comunică cu pacienții prin chat' },
    { to: '/analytics', label: 'Analitica', icon: BarChart3, description: 'Analizează performanța cabinetului' },
    { to: '/profile', label: 'Profil', icon: User, description: 'Gestionează profilul și setările' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/signin')
    setOpen(false)
  }

  const handleThemeToggle = () => {
    setDark(v => !v)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/60 backdrop-blur-md dark:bg-gray-950/70 dark:border-gray-800/50"
      role="banner"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* 
        ⚠️  CRITICAL: DO NOT MODIFY THIS LOGO SECTION ⚠️
        
        REQUIREMENTS FOR FUTURE AI AGENTS:
        1. Logo size MUST remain: h-10 w-10 md:h-11 md:w-11 (40px mobile, 44px desktop)
        2. Logo position MUST remain: marginTop: '-2px' (exactly 2px above center)
        3. Text size MUST remain: text-2xl md:text-3xl (24px mobile, 30px desktop)
        4. Default colors MUST remain: #9479A8 (matching original SVG purple tone)
        5. Logo gradient MUST remain: blue→purple (90deg, #3B82F6 0%, #7C3AED 100%)
        6. Text gradient MUST remain: purple→blue (90deg, #7C3AED 0%, #3B82F6 100%) - INVERTED from logo
        7. Animations MUST remain synchronized with group-hover and 300ms ease-in-out transitions
        8. Logo MUST always redirect to "/" (landing page) regardless of login status
        9. Logo MUST stay still (no movement/rotation on hover)
        10. Both elements MUST animate together when hovering over either logo OR text
        
        This configuration was specifically requested and perfected by the user.
        Any changes to sizing, colors, positioning, or animations will break the intended design.
        */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
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
                background: 'linear-gradient(90deg, #3B82F6 0%, #7C3AED 100%)',
              }}
            />
          </div>
          {/* Text container - DO NOT CHANGE SIZE OR COLORS */}
          <span 
            className="text-2xl md:text-3xl font-bold transition-all duration-300 ease-in-out relative"
          >
            {/* Default text color - MUST match logo color #9479A8 */}
            <span 
              className="transition-opacity duration-300 ease-in-out group-hover:opacity-0"
              style={{ color: '#9479A8' }}
            >
              MedFlow
            </span>
            {/* Gradient text overlay - purple→blue (INVERTED from logo) - DO NOT CHANGE */}
            <span 
              className="absolute inset-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
              style={{
                backgroundImage: 'linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              MedFlow
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Navigare principală">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`
              }
              aria-label={`${item.label} - ${item.description}`}
            >
              <item.icon className="w-4 h-4" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg" 
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                  to="/signup"
                  aria-label="Creează cont nou"
                >
                  Înregistrare
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setOpen(o => !o)}
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
            className="border-t border-gray-200/50 bg-white/95 backdrop-blur-md dark:bg-gray-950/95 dark:border-gray-800/50 md:hidden overflow-hidden"
            id="mobile-menu"
            role="navigation"
            aria-label="Meniul mobil"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                      }`
                    }
                    aria-label={`${item.label} - ${item.description}`}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                </motion.div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temă</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleThemeToggle}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      className="px-3 py-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg" 
                      to="/signin"
                      onClick={() => setOpen(false)}
                      aria-label="Autentificare în cont"
                    >
                      Autentificare
                    </Link>
                    <Link 
                      className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                      to="/signup"
                      onClick={() => setOpen(false)}
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