import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import realData from '../data/realData.json'

interface ContactSectionProps {
  className?: string
}

export default function ContactSection({ className = '' }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    practiceType: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', phone: '', message: '', practiceType: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const practiceTypes = [
    'Medicină generală',
    'Cardiologie',
    'Dermatologie',
    'Ginecologie',
    'Pediatrie',
    'Ortopedie',
    'Neurologie',
    'Psihiatrie',
    'Altele'
  ]

  return (
    <motion.section 
      id="contact"
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-6), var(--medflow-brand-7))' }}
      role="region"
      aria-labelledby="contact-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="contact-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Să discutăm despre
            <span className="bg-gradient-to-r from-[var(--medflow-brand-1)] via-[var(--medflow-brand-2)] to-[var(--medflow-brand-3)] bg-clip-text text-transparent"> viitorul</span>
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed">
            Suntem aici să vă ajutăm să transformați cabinetul medical într-o practică digitală modernă și eficientă
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Informații de contact
              </h3>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Echipa MedFlow este disponibilă să răspundă la întrebările dvs. și să vă ghideze prin procesul de implementare.
              </p>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:border-[var(--medflow-brand-1)]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[var(--medflow-brand-1)]" />
                </div>
                <div>
                  <div className="text-white font-semibold">Email</div>
                  <a 
                    href={`mailto:${realData.company.email}`}
                    className="text-[var(--medflow-brand-1)] hover:text-[var(--medflow-brand-1)] transition-colors duration-300"
                  >
                    {realData.company.email}
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:border-[var(--medflow-brand-1)]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[var(--medflow-brand-1)]" />
                </div>
                <div>
                  <div className="text-white font-semibold">Telefon</div>
                  <a 
                    href={`tel:${realData.company.phone}`}
                    className="text-[var(--medflow-brand-1)] hover:text-[var(--medflow-brand-1)] transition-colors duration-300"
                  >
                    {realData.company.phone}
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:border-[var(--medflow-brand-1)]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[var(--medflow-brand-1)]" />
                </div>
                <div>
                  <div className="text-white font-semibold">Locație</div>
                  <div className="text-[var(--medflow-brand-1)]">{realData.company.location}</div>
                </div>
              </motion.div>
            </div>

            {/* Company Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-xl border border-[var(--medflow-brand-1)]/30"
            >
              <h4 className="text-lg font-semibold text-white mb-3">Status platformă</h4>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80">{realData.company.status}</span>
              </div>
              <p className="text-white/60 text-sm mt-2">
                Accesul timpuriu este disponibil pentru medicii interesați să testeze platforma înainte de lansarea oficială.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-12 bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl border border-[var(--medflow-brand-1)]/30"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mulțumim pentru mesaj!</h3>
                <p className="text-white/80 text-lg">
                  Vom reveni în cel mai scurt timp cu informații despre cum să începeți cu MedFlow.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Nume complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20 transition-all duration-300"
                      placeholder="Dr. Popescu Maria"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20 transition-all duration-300"
                      placeholder="dr.popescu@email.com"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="practiceType" className="block text-white font-medium mb-2">
                    Tipul practicii medicale
                  </label>
                  <select
                    id="practiceType"
                    name="practiceType"
                    value={formData.practiceType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:outline-none focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20 transition-all duration-300"
                  >
                    <option value="">Selectează specialitatea</option>
                    {practiceTypes.map((type, index) => (
                      <option key={index} value={type} className="bg-[var(--medflow-brand-6)] text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Mesajul tău *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[var(--medflow-brand-1)] focus:ring-2 focus:ring-[var(--medflow-brand-1)]/20 transition-all duration-300 resize-none"
                    placeholder="Spune-ne despre nevoile tale și cum te poate ajuta MedFlow..."
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[var(--medflow-brand-7)]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Se trimite...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Trimite mesajul</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                <p className="text-white/60 text-sm text-center">
                  * Câmpurile obligatorii. Răspunsul va fi trimis în maxim 24 de ore.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
