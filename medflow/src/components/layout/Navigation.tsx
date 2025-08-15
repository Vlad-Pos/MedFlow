import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Button from '../ui/Button'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { name: 'Acasă', href: '#home' },
    { name: 'Funcționalități', href: '#features' },
    { name: 'Demo', href: '#demo' },
    { name: 'Despre', href: '#about' },
    { name: 'Prețuri', href: '#pricing' },
    { name: 'Contact', href: '#contact' }
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[var(--medflow-surface-elevated)]/95 backdrop-blur-md shadow-lg border-b border-[var(--medflow-border)]' 
        : 'bg-transparent'
    } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <a href="#home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MF</span>
              </div>
              <span className={`text-xl font-bold ${
                isScrolled ? 'text-[var(--medflow-text-primary)]' : 'text-white'
              }`}>
                MedFlow
              </span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigationItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`text-sm font-medium transition-colors duration-200 hover:text-[var(--medflow-brand-1)] ${
                  isScrolled ? 'text-[var(--medflow-text-secondary)]' : 'text-white/90'
                }`}
                onClick={closeMobileMenu}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button variant="ghost" size="sm" href="#contact">
                Contact
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button variant="primary" size="sm" href="#demo">
                Începeți gratuit
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className={`p-2 rounded-md transition-colors duration-200 ${
                isScrolled ? 'text-[var(--medflow-text-primary)]' : 'text-white'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-[var(--medflow-surface-elevated)] border-t border-[var(--medflow-border)]"
          >
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="block text-base font-medium text-[var(--medflow-text-primary)] hover:text-[var(--medflow-brand-1)] transition-colors duration-200 py-2"
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </motion.a>
              ))}
              
              <div className="pt-4 space-y-3">
                <Button variant="ghost" size="md" fullWidth href="#contact" onClick={closeMobileMenu}>
                  Contact
                </Button>
                <Button variant="primary" size="md" fullWidth href="#demo" onClick={closeMobileMenu}>
                  Începeți gratuit
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
