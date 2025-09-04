import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Card from '../ui/Card'

interface TestimonialsSectionProps {
  className?: string
}

export default function TestimonialsSection({ className = '' }: TestimonialsSectionProps) {
  // Demo feedback from early testing - clearly marked as such
  const demoFeedback = [
    {
      name: 'Dr. Maria Popescu',
      role: 'Medic de familie',
      location: 'București',
      feedback: 'Interfața este foarte intuitivă. Am testat platforma în timpul demo-ului și am fost impresionată de ușurința cu care pot gestiona programările.',
      rating: 5,
      type: 'Demo Feedback',
      date: 'Decembrie 2024'
    },
    {
      name: 'Dr. Alexandru Ionescu',
      role: 'Cardiolog',
      location: 'Cluj-Napoca',
      feedback: 'Funcționalitățile de raportare sunt exact ce aveam nevoie. Sistemul de notificări este foarte util pentru pacienți.',
      rating: 5,
      type: 'Demo Feedback',
      date: 'Decembrie 2024'
    },
    {
      name: 'Dr. Elena Dumitrescu',
      role: 'Pediatru',
      location: 'Timișoara',
      feedback: 'Am apreciat că platforma este gândită pentru nevoile reale ale medicilor. Interfața mobilă este excelentă.',
      rating: 5,
      type: 'Demo Feedback',
      date: 'Decembrie 2024'
    }
  ]

  return (
    <motion.section
      id="testimonials"
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-6), var(--medflow-brand-7))' }}
      role="region"
      aria-labelledby="testimonials-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="testimonials-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Feedback de la
            <span className="bg-gradient-to-r from-[var(--medflow-brand-2)] via-[var(--medflow-brand-3)] to-[var(--medflow-brand-4)] bg-clip-text text-transparent"> utilizatori</span>
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed">
            Auziți direct de la medicii care au testat platforma în timpul demo-urilor noastre
          </p>
        </motion.div>

        {/* Demo Feedback Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl p-6 border border-[var(--medflow-brand-1)]/30 inline-block">
            <p className="text-white/80 text-lg">
              <strong>Notă importantă:</strong> Acestea sunt feedback-uri de la participanții la demo-urile noastre. 
              Platforma este în curs de dezvoltare și va fi disponibilă în curând pentru toți medicii.
            </p>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {demoFeedback.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="h-full p-6 relative">
                {/* Demo Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-[var(--medflow-brand-1)] text-white text-xs px-2 py-1 rounded-full font-medium">
                    {testimonial.type}
                  </span>
                </div>

                {/* Quote Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-full flex items-center justify-center mb-4">
                  <Quote className="w-6 h-6 text-[var(--medflow-brand-1)]" />
                </div>

                {/* Feedback Text */}
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.feedback}"
                </blockquote>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Author Info */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      <p className="text-gray-500 text-sm">{testimonial.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">{testimonial.date}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Vrei să testezi platforma?
            </h3>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Programează un demo personalizat și descoperă cum MedFlow poate transforma practica ta medicală.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#demo"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] text-white font-medium rounded-lg hover:from-[var(--medflow-brand-2)] hover:to-[var(--medflow-brand-5)] transition-all duration-300 transform hover:scale-105"
              >
                Programează demo-ul
              </a>
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Contactează-ne
              </a>
            </div>
          </div>
        </motion.div>

        {/* Early Access Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] rounded-2xl p-6 border border-[var(--medflow-brand-1)]/30">
            <h4 className="text-xl font-bold text-white mb-3">
              Acces timpuriu disponibil
            </h4>
            <p className="text-white/80 text-lg mb-4">
              Cabinetele medicale care se înscriu acum vor avea acces prioritar la platformă 
              și vor beneficia de prețuri speciale de lansare.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center px-6 py-3 bg-white text-[var(--medflow-brand-6)] font-medium rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              Solicită acces timpuriu
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
