import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '../../providers/AuthProvider'
import medflowLogo from '../../assets/medflow-logo.svg'

interface HeaderProps {
  className?: string
}

export default function Header({ className = '' }: HeaderProps) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { href: '#home', label: 'Acasă' },
    { href: '#features', label: 'Funcționalități' },
    { href: '#demo', label: 'Demo' },
    { href: '#contact', label: 'Contact' }
  ]

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[var(--medflow-surface-elevated)]/95 backdrop-blur-md border-b border-[var(--medflow-border)]/50 shadow-lg' 
          : 'bg-transparent'
      } ${className}`}
      role="banner"
      aria-label="Navigație principală MedFlow"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-6)] rounded-xl flex items-center justify-center p-1">
              <img src={medflowLogo} alt="MedFlow" className="w-6 h-6 filter brightness-0 invert" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)] bg-clip-text text-transparent ${
              scrolled ? 'text-[var(--medflow-text-primary)]' : 'text-white'
            }`}>
              MedFlow
            </span>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Meniu principal">
            {navigationItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                className={`transition-colors font-medium hover:text-[var(--medflow-brand-1)] ${
                  scrolled ? 'text-[var(--medflow-text-secondary)] hover:text-[var(--medflow-brand-1)]' : 'text-white/90 hover:text-white'
                }`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
              </motion.div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className={`transition-colors font-medium hover:text-[var(--medflow-brand-1)] ${
                    scrolled ? 'text-[var(--medflow-text-secondary)]' : 'text-white/90'
                  }`}
                >
                  Autentificare
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Înregistrează-te pentru beta
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'text-[var(--medflow-text-secondary)] hover:text-[var(--medflow-brand-1)]' : 'text-white/90 hover:text-white'
              }`}
              aria-label={mobileMenuOpen ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--medflow-border)]/20 py-4"
            >
              <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`transition-colors hover:text-[var(--medflow-brand-1)] ${
                      scrolled ? 'text-[var(--medflow-text-secondary)]' : 'text-white/90'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-[var(--medflow-border)]/20">
                    <Link 
                      to="/signin" 
                      className={`font-medium ${
                        scrolled ? 'text-[var(--medflow-text-secondary)]' : 'text-white/90'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Autentificare
                    </Link>
                                          <Link 
                        to="/signup" 
                        className="bg-gradient-to-r from-[var(--medflow-brand-7)] to-[var(--medflow-brand-4)] text-white px-4 py-2 rounded-lg text-center font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Înregistrează-te pentru beta
                      </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
