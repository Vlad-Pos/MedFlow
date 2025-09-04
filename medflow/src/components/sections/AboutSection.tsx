import { motion } from 'framer-motion'
import { Users, Target, Award, Heart } from 'lucide-react'
import realData from '../data/realData.json'
import Card from '../ui/Card'

interface AboutSectionProps {
  className?: string
}

export default function AboutSection({ className = '' }: AboutSectionProps) {
  const companyValues = [
    {
      icon: Heart,
      title: 'Pasiune pentru sănătate',
      description: 'Credem că tehnologia poate transforma modul în care se oferă îngrijirea medicală, făcând-o mai eficientă și mai accesibilă pentru toți.'
    },
    {
      icon: Target,
      title: 'Inovație continuă',
      description: 'Ne dedicăm dezvoltării de soluții inovatoare care răspund nevoilor reale ale comunității medicale moderne.'
    },
    {
      icon: Users,
      title: 'Comunitate medicală',
      description: 'Construim o comunitate de medici care împărtășesc cunoștințe și experiențe pentru a îmbunătăți îngrijirea pacientului.'
    },
    {
      icon: Award,
      title: 'Calitate superioară',
      description: 'Ne angajăm să oferim produse de cea mai înaltă calitate, cu focus pe securitate, performanță și experiența utilizatorului.'
    }
  ]

  const milestones = [
    {
      year: '2024',
      title: 'Lansarea platformei',
      description: 'MedFlow devine disponibil pentru cabinetele medicale'
    },
    {
      year: '2024',
      title: 'Primii utilizatori',
      description: 'Cabinetele medicale încep să folosească platforma în mod activ'
    },
    {
      year: '2024',
      title: 'Expansiunea funcționalităților',
      description: 'Adăugarea de noi caracteristici bazate pe feedback-ul utilizatorilor'
    },
    {
      year: '2025',
      title: 'Expansiunea geografică',
      description: 'Extinderea platformei în alte regiuni'
    }
  ]

  return (
    <motion.section
      id="about"
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-6), var(--medflow-brand-7))' }}
      role="region"
      aria-labelledby="about-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="about-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Despre
            <span className="bg-gradient-to-r from-[var(--medflow-brand-2)] via-[var(--medflow-brand-3)] to-[var(--medflow-brand-4)] bg-clip-text text-transparent"> MedFlow</span>
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed">
            Transformăm practica medicală prin tehnologie inovatoare și o abordare centrată pe utilizator
          </p>
        </motion.div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              Povestea noastră
            </h3>
            <div className="space-y-4 text-white/80 text-lg leading-relaxed">
              <p>
                MedFlow a fost creat din dorința de a moderniza și simplifica practica medicală. 
                Echipa noastră, formată din dezvoltatori, designeri și profesioniști din domeniul medical, 
                a identificat nevoia urgentă de digitalizare în sectorul sănătății.
              </p>
              <p>
                Am început cu o viziune simplă: să creăm o platformă care să permită medicilor să se 
                concentreze pe ceea ce fac cel mai bine - să îngrijească pacienții - în timp ce tehnologia 
                gestionează automat toate aspectele administrative.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30">
              <h4 className="text-xl font-bold text-white mb-4">Viziunea noastră</h4>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Să devenim platforma de referință pentru digitalizarea practicilor medicale din România, 
                oferind soluții inovatoare care îmbunătățesc calitatea îngrijirii medicale și experiența 
                atât pentru medici, cât și pentru pacienți.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--medflow-brand-1)]">100%</div>
                  <div className="text-white/70 text-sm">Conformitate GDPR</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--medflow-brand-1)]">24/7</div>
                  <div className="text-white/70 text-sm">Suport tehnic</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Company Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Valorile noastre
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="h-full text-center p-6">
                              <div className="w-16 h-16 bg-gradient-to-r from-[var(--medflow-brand-1)]/20 to-[var(--medflow-brand-4)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <value.icon className="w-8 h-8 text-[var(--medflow-brand-1)]" />
            </div>
                  <h4 className="text-lg font-semibold text-white mb-3">{value.title}</h4>
                  <p className="text-white/70 text-sm leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Drumul nostru
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-[var(--medflow-brand-1)] via-[var(--medflow-brand-4)] to-transparent"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] rounded-full border-4 border-[var(--medflow-brand-7)] z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="p-6">
                      <div className="text-2xl font-bold text-[var(--medflow-brand-1)] mb-2">{milestone.year}</div>
                      <h4 className="text-lg font-semibold text-white mb-2">{milestone.title}</h4>
                      <p className="text-white/70 text-sm">{milestone.description}</p>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Echipa noastră
            </h3>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Suntem o echipă dedicată de profesioniști cu experiență în tehnologie, design și sănătate. 
              Ne pasă de fiecare utilizator și ne angajăm să oferim cea mai bună experiență posibilă.
            </p>
            <p className="text-white/60 text-sm">
              Echipa MedFlow este în curs de creștere. Dacă ești pasionat de tehnologie și sănătate, 
              contactează-ne pentru a afla despre oportunitățile de colaborare.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
