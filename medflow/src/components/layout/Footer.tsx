import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import realData from '../data/realData.json'

interface FooterProps {
  className?: string
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Platforma',
      links: [
        { name: 'Funcționalități', href: '#features' },
        { name: 'Demo', href: '#demo' },
        { name: 'Securitate', href: '#security' },
        { name: 'Prețuri', href: '#pricing' }
      ]
    },
    {
      title: 'Compania',
      links: [
        { name: 'Despre noi', href: '#about' },
        { name: 'Contact', href: '#contact' },
        { name: 'Blog', href: '/blog' },
        { name: 'Cariere', href: '/careers' }
      ]
    },
    {
      title: 'Suport',
      links: [
        { name: 'Centru de ajutor', href: '/help' },
        { name: 'Documentație', href: '/docs' },
        { name: 'Comunitate', href: '/community' },
        { name: 'Status platformă', href: '/status' }
      ]
    }
  ]

  return (
    <motion.footer
      className={`bg-gradient-to-b from-[var(--medflow-brand-7)] to-[var(--medflow-brand-6)] ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-2xl font-bold text-white">MedFlow</span>
              </div>
              <p className="text-white/80 text-lg leading-relaxed max-w-md">
                Transformăm practica medicală prin tehnologie inovatoare și securitate de nivel militar.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors duration-300">
                <Mail className="w-4 h-4 text-[var(--medflow-brand-1)]" />
                <a href={`mailto:${realData.company.email}`} className="hover:text-[var(--medflow-brand-1)]">
                  {realData.company.email}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors duration-300">
                <Phone className="w-4 h-4 text-[var(--medflow-brand-1)]" />
                <a href={`tel:${realData.company.phone}`} className="hover:text-[var(--medflow-brand-1)]">
                  {realData.company.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <MapPin className="w-4 h-4 text-[var(--medflow-brand-1)]" />
                <span>{realData.company.location}</span>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-white font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                  >
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-[var(--medflow-brand-1)] transition-colors duration-300 flex items-center group"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"
        />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm"
          >
            © {currentYear} {realData.company.name}. Toate drepturile rezervate.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center space-x-6"
          >
            <span className="text-white/60 text-sm">Status: </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">{realData.company.status}</span>
            </div>
          </motion.div>
        </div>

        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-6 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-white/50">
            <a href="/privacy" className="hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
              Politica de confidențialitate
            </a>
            <a href="/terms" className="hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
              Termeni și condiții
            </a>
            <a href="/gdpr" className="hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
              Conformitate GDPR
            </a>
            <a href="/cookies" className="hover:text-[var(--medflow-brand-1)] transition-colors duration-300">
              Politica de cookie-uri
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
