import { motion } from 'framer-motion'
import { ArrowRight, Calendar, MessageCircle, Play } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface CTASectionProps {
  className?: string
}

export default function CTASection({ className = '' }: CTASectionProps) {
  const ctaOptions = [
    {
      icon: Calendar,
      title: 'Rezervați demonstrația medicală exclusivă',
      description: 'Prezentare completă MedFlow în 45 de minute, personalizată pentru specialitatea și nevoile specifice ale cabinetului dumneavoastră',
      action: 'Rezervați demonstrația acum',
      variant: 'primary' as const,
      href: '#demo'
    },
    {
      icon: MessageCircle,
      title: 'Consultanță cu specialist în digitalizare medicală',
      description: 'Analiză profesională gratuită a nevoilor de digitalizare ale cabinetului dumneavoastră cu recomendări personalizate',
      action: 'Programați consultanța gratuită',
      variant: 'outline' as const,
      href: '#contact'
    },
    {
      icon: Play,
      title: 'Explorați platforma în tour virtual ghidat',
      description: 'Descoperiți toate funcționalitățile MedFlow în 8 minute printr-un tur virtual interactiv complet și detaliat',
      action: 'Începeți turul virtual',
      variant: 'ghost' as const,
      href: '#demo'
    }
  ]

  return (
    <motion.section
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-7), var(--medflow-brand-6))' }}
      role="region"
      aria-labelledby="cta-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="cta-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Sunteți gata să revoluționați practica dumneavoastră medicală?
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed mb-8">
            Alăturați-vă elitei medicale care adoptă tehnologia de vârf. MedFlow este instrumentul pe care îl aștepta medicina modernă română pentru a atinge excelența operațională.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="xl" variant="primary" className="group">
              Accesați platforma exclusiv acum
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button size="xl" variant="outline">
              Demonstrație medicală personalizată
            </Button>
          </div>
        </motion.div>

        {/* CTA Options Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {ctaOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="h-full p-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <option.icon className="w-8 h-8 text-[var(--medflow-brand-1)]" />
            </div>
                <h3 className="text-xl font-semibold text-white mb-3">{option.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">{option.description}</p>
                <Button
                  variant={option.variant}
                  size="md"
                  fullWidth
                  href={option.href}
                  className="group"
                >
                  {option.action}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30">
            <h3 className="text-2xl font-bold text-white mb-6">
              De ce să alegi MedFlow?
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { number: '100%', label: 'Conformitate GDPR' },
                { number: '24/7', label: 'Suport tehnic' },
                { number: '14', label: 'Zile probă gratuită' },
                { number: '0', label: 'Costuri de setup' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-[var(--medflow-brand-1)] mb-2">{stat.number}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              MedFlow este construit cu focus pe securitate, performanță și experiența utilizatorului. 
              Ne angajăm să oferim cea mai bună platformă pentru digitalizarea practicilor medicale.
            </p>
            
            <Button size="lg" variant="primary" href="#contact">
              Discută cu expertul nostru
            </Button>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-6)] to-[var(--medflow-brand-4)] rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Nu ești sigur dacă MedFlow este pentru tine?
            </h3>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Programează o consultație gratuită de 15 minute. Vom discuta despre nevoile tale 
              și vom determina împreună dacă MedFlow este soluția potrivită.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="primary">
                Programează consultația gratuită
              </Button>
              <Button size="lg" variant="ghost">
                Vezi toate funcționalitățile
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
