import React from "react";
import { Header, Hero, Features, Pricing, Contact, Footer } from "./modules";
import { FadeInSection, ScrollGradientBackground } from "./modules/ui";

export default function EnhancedBasicLayout() {
  const headerData = {
    title: "MedFlow",
    navLinks: [
      { id: "features", text: "Features", href: "#features" },
      { id: "pricing", text: "Pricing", href: "#pricing" },
      { id: "contact", text: "Contact", href: "#contact" },
    ],
  };

  const heroData = {
    headline: "Revolutionary Healthcare Management",
    description: "Streamline your medical practice with our comprehensive, AI-powered healthcare management platform. Boost efficiency, reduce errors, and enhance patient care.",
    ctaText: "Get Started Today",
    onCtaClick: () => console.log("Hero CTA clicked"),
  };

  const featuresData = {
    title: "Key Features",
    features: [
      { id: "1", text: "AI-Powered Patient Scheduling & Management" },
      { id: "2", text: "Advanced Electronic Health Records (EHR)" },
      { id: "3", text: "Real-time Analytics & Reporting Dashboard" },
      { id: "4", text: "Secure HIPAA-Compliant Communication" },
      { id: "5", text: "Integrated Billing & Payment Processing" },
      { id: "6", text: "Mobile-First Responsive Design" },
    ],
  };

  const pricingData = {
    title: "Pricing Plans",
    description: "Choose the perfect plan for your healthcare practice. All plans include our core features with scalable options.",
    plans: [
      {
        id: "1",
        name: "Starter",
        price: "$99/month",
        features: ["Up to 10 providers", "Basic EHR", "Patient scheduling", "Email support"],
        ctaText: "Start Free Trial",
        onSelect: () => console.log("Starter plan selected"),
      },
      {
        id: "2",
        name: "Professional",
        price: "$199/month",
        features: ["Up to 50 providers", "Advanced EHR", "Analytics dashboard", "Priority support", "Custom integrations"],
        ctaText: "Get Started",
        onSelect: () => console.log("Professional plan selected"),
      },
      {
        id: "3",
        name: "Enterprise",
        price: "Custom",
        features: ["Unlimited providers", "Full platform access", "Dedicated support", "Custom development", "On-premise options"],
        ctaText: "Contact Sales",
        onSelect: () => console.log("Enterprise plan selected"),
      },
    ],
  };

  const contactData = {
    title: "Get In Touch",
    description: "Ready to transform your healthcare practice? Our team is here to help you get started.",
    onSubmit: (data: { email: string; message: string }) => {
      console.log("Contact form submitted:", data);
      // Here you would typically send the data to your backend
    },
  };

  const footerData = {
    copyrightText: "© 2025 MedFlow. All rights reserved. HIPAA compliant healthcare solutions.",
  };

  return (
    <ScrollGradientBackground>
              <div className="min-h-screen flex flex-col bg-[var(--medflow-brand-7)] text-white">
        <Header {...headerData} />
        
        <Hero {...heroData} />
        
        <main className="px-6 py-12 max-w-5xl mx-auto space-y-20">
          <FadeInSection>
            <section id="features">
              <Features {...featuresData} />
            </section>
          </FadeInSection>

          <FadeInSection>
            <section id="pricing">
              <Pricing {...pricingData} />
            </section>
          </FadeInSection>

          <FadeInSection>
            <section id="contact">
              <Contact {...contactData} />
            </section>
          </FadeInSection>
        </main>
        
        <Footer {...footerData} />
      </div>
    </ScrollGradientBackground>
  );
}

