import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlowButton } from "./ui";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  onSelect: () => void;
}

const pricingData: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "0",
    period: "lună",
    description: "Perfect pentru cabinetele mici care încep digitalizarea",
    features: [
      "Până la 100 de pacienți",
      "Programări de bază",
      "Calendar simplu",
      "Suport prin email",
      "1 utilizator"
    ],
    ctaText: "Începe Gratuit",
    onSelect: () => console.log("Starter plan selected")
  },
  {
    id: "professional",
    name: "Professional",
    price: "49",
    period: "lună",
    description: "Soluția completă pentru cabinetele în creștere",
    features: [
      "Până la 1000 de pacienți",
      "Programări avansate",
      "Dashboard analitica",
      "Chatbot asistent",
      "Suport priorititar",
      "Până la 5 utilizatori",
      "Facturare integrată",
      "Backup automat"
    ],
    popular: true,
    ctaText: "Începe Perioada Gratuită",
    onSelect: () => console.log("Professional plan selected")
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "99",
    period: "lună",
    description: "Pentru clinici mari și lanțuri de cabinete",
    features: [
      "Pacienți nelimitați",
      "Toate funcționalitățile",
      "API personalizat",
      "Suport dedicat 24/7",
      "Utilizatori nelimitați",
      "Integrări personalizate",
      "Training personalizat",
      "SLA garantat"
    ],
    ctaText: "Contactează Vânzările",
    onSelect: () => console.log("Enterprise plan selected")
  }
];

export default function EnhancedPricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Planuri de Preț Transparente
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Alege planul perfect pentru cabinetul tău medical. Toate planurile includ perioada gratuită de 14 zile.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingData.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 ${
                plan.popular 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-pink-900/20' 
                  : 'border-white/10 hover:border-white/20'
              } transition-all duration-300`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  Cel Mai Popular
                </motion.div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">RON/{plan.period}</span>
                </div>
                {plan.price === "0" && (
                  <p className="text-green-400 text-sm mt-2">Pentru totdeauna gratuit</p>
                )}
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    className="flex items-center space-x-3 text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + featureIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlowButton onClick={plan.onSelect}>
                  {plan.ctaText}
                </GlowButton>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 mb-4">
            Ai întrebări despre planuri? Contactează echipa noastră de vânzări.
          </p>
          <GlowButton onClick={() => console.log("Contact sales clicked")}>
            Contactează Vânzările
          </GlowButton>
        </motion.div>
      </div>
    </section>
  );
}



