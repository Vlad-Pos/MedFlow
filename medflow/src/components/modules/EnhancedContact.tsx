import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlowButton } from "./ui";

interface ContactForm {
  name: string;
  email: string;
  company: string;
  message: string;
  interest: string;
}

const interestOptions = [
  "Programări medicale",
  "Dashboard analitica",
  "Chatbot asistent",
  "Facturare integrată",
  "API și integrări",
  "Altele"
];

export default function EnhancedContact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    company: "",
    message: "",
    interest: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        message: "",
        interest: ""
      });
    }, 3000);
  };

  const isFormValid = formData.name && formData.email && formData.message && formData.interest;

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Să Începem Discuția
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Suntem aici să te ajutăm să transformi cabinetul tău medical. 
            Contactează-ne pentru o consultație gratuită.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Informații de Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-300">contact@medflow.ro</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Telefon</p>
                    <p className="text-gray-300">+40 123 456 789</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Adresă</p>
                    <p className="text-gray-300">București, România</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Program de Lucru
              </h4>
              <div className="space-y-2 text-gray-300">
                <p>Luni - Vineri: 9:00 - 18:00</p>
                <p>Sâmbătă: 10:00 - 14:00</p>
                <p>Duminică: Închis</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Suport Tehnic
              </h4>
              <p className="text-gray-300">
                Echipa noastră de suport este disponibilă 24/7 pentru planurile Enterprise 
                și în programul de lucru pentru celelalte planuri.
              </p>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {submitSuccess ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Mesajul a fost Trimis!
                </h3>
                <p className="text-gray-300 mb-6">
                  Mulțumim pentru mesaj! Vom reveni în cel mai scurt timp cu răspunsul.
                </p>
                <motion.div
                  className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Nume Complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Introdu numele tău"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="email@exemplu.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-white font-medium mb-2">
                    Cabinet/Clinică
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Numele cabinetului tău"
                  />
                </div>
                
                <div>
                  <label htmlFor="interest" className="block text-white font-medium mb-2">
                    Interesat de *
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Selectează o opțiune</option>
                    {interestOptions.map((option) => (
                      <option key={option} value={option} className="bg-gray-800 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Mesaj *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Descrie cum te putem ajuta..."
                    required
                  />
                </div>
                
                <motion.div
                  className="pt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button 
                    type="submit" 
                    disabled={!isFormValid || isSubmitting}
                    className="
                      px-6 py-3 rounded-lg bg-purple-700 text-white font-semibold
                      focus:outline-none focus:ring-4 focus:ring-purple-500
                      relative overflow-hidden
                      transition duration-300 ease-in-out
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Se trimite...</span>
                      </div>
                    ) : (
                      "Trimite Mesajul"
                    )}
                  </button>
                </motion.div>
                
                <p className="text-sm text-gray-400 text-center">
                  Prin trimiterea acestui formular, ești de acord cu 
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline ml-1">
                    Politica de Confidențialitate
                  </a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


