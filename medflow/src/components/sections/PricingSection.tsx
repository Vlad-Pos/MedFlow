import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap, Shield, Users, Clock } from 'lucide-react'
import realData from '../data/realData.json'
import Button from '../ui/Button'
import Card, { CardHeader, CardContent, CardFooter } from '../ui/Card'

interface PricingSectionProps {
  className?: string
}

export default function PricingSection({ className = '' }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect pentru cabinetele medicale mici',
      icon: Users,
      features: [
        'Până la 100 de pacienți',
        'Programări online',
        'Istoric medical de bază',
        'Suport prin email',
        'Backup automat'
      ],
      monthlyPrice: 49,
      yearlyPrice: 39,
      popular: false,
      color: 'from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)]'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Pentru practici medicale în creștere',
      icon: Shield,
      features: [
        'Până la 500 de pacienți',
        'Toate funcționalitățile Starter',
        'Rapoarte avansate',
        'Integrare cu laboratoare',
        'Suport telefonic',
        'API acces'
      ],
      monthlyPrice: 99,
      yearlyPrice: 79,
      popular: true,
      color: 'from-[var(--medflow-brand-2)] to-[var(--medflow-brand-5)]'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Pentru clinici mari și spitale',
      icon: Zap,
      features: [
        'Pacienți nelimitați',
        'Toate funcționalitățile Professional',
        'Personalizare avansată',
        'Suport dedicat 24/7',
        'Integrări personalizate',
        'SLA garantat',
        'Training personalizat'
      ],
      monthlyPrice: 199,
      yearlyPrice: 159,
      popular: false,
      color: 'from-[var(--medflow-brand-6)] to-[var(--medflow-brand-7)]'
    }
  ]

  const getCurrentPrice = (plan: typeof pricingPlans[0]) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
  }

  const getSavings = (plan: typeof pricingPlans[0]) => {
    if (billingCycle === 'yearly') {
      const savings = plan.monthlyPrice - plan.yearlyPrice
      return Math.round((savings / plan.monthlyPrice) * 100)
    }
    return 0
  }

  return (
    <motion.section
      id="pricing"
      className={`py-20 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--medflow-brand-7), var(--medflow-brand-6))' }}
      role="region"
      aria-labelledby="pricing-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 id="pricing-title" className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Prețuri
            <span className="bg-gradient-to-r from-[var(--medflow-brand-2)] via-[var(--medflow-brand-3)] to-[var(--medflow-brand-4)] bg-clip-text text-transparent"> transparente</span>
          </h2>
          <p className="text-xl md:text-2xl text-white font-light max-w-4xl mx-auto leading-relaxed">
            Alegeți planul perfect pentru nevoile cabinetului medical. Fără costuri ascunse, fără surprize.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/10 backdrop-blur rounded-xl p-1 border border-white/20">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[var(--medflow-brand-7)] shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Facturare lunară
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-[var(--medflow-brand-7)] shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Facturare anuală
                {billingCycle === 'yearly' && (
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    Economisește 20%
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="bg-gradient-to-r from-[var(--medflow-brand-1)] to-[var(--medflow-brand-4)] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Cel mai popular</span>
                  </div>
                </motion.div>
              )}

              <Card
                variant={plan.popular ? 'elevated' : 'default'}
                className={`h-full ${plan.popular ? 'ring-2 ring-[var(--medflow-brand-1)]/50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader>
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{plan.description}</p>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-4xl font-bold text-white">€{getCurrentPrice(plan)}</span>
                      <span className="text-white/60">/lună</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="mt-2">
                        <span className="text-green-400 text-sm font-medium">
                          Economisește {getSavings(plan)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: featureIndex * 0.05 }}
                        className="flex items-center space-x-3 text-white/80"
                      >
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                    className="group"
                  >
                    Începeți gratuit
                    <Clock className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-[var(--medflow-brand-1)]/10 to-[var(--medflow-brand-4)]/10 rounded-2xl p-8 border border-[var(--medflow-brand-1)]/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Încercați gratuit timp de 14 zile
            </h3>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              Fără obligații, fără card de credit. Puteți anula oricând. Toate planurile includ perioada de probă gratuită.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="primary">
                Începeți perioada de probă
              </Button>
              <Button size="lg" variant="ghost">
                Contactați echipa de vânzări
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
