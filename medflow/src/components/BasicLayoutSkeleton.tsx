import React from "react";
import medflowLogo from "../assets/medflow-logo.svg";
import { FadeInSection, GlowButton } from "./modules/ui";

export default function BasicLayoutSkeleton() {
  return (
            <div className="min-h-screen flex flex-col bg-[var(--medflow-brand-7)] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 md:px-12 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <img src={medflowLogo} alt="MedFlow" className="h-8 w-8" />
          <div className="text-xl font-semibold">MedFlow</div>
        </div>
        <nav className="space-x-6 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-grow px-6 py-12 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-semibold mb-6 leading-snug text-white">Headline Here</h1>
        <p className="text-lg mb-4 leading-relaxed text-gray-300 max-w-xl">
          Introductory paragraph or value proposition goes here.
        </p>
        <GlowButton onClick={() => console.log("Hero CTA clicked")}>
          Call to Action
        </GlowButton>
      </section>

      {/* Main Content */}
      <main className="px-6 py-12 max-w-5xl mx-auto space-y-20">
        <FadeInSection>
          <section id="features" className="text-center">
            <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">Key Features</h2>
            <ul className="text-lg mb-4 leading-relaxed text-gray-300 text-left max-w-3xl mx-auto space-y-4">
              <li>• Feature 1 placeholder</li>
              <li>• Feature 2 placeholder</li>
              <li>• Feature 3 placeholder</li>
              <li>• Feature 4 placeholder</li>
              <li>• Feature 5 placeholder</li>
            </ul>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section id="pricing" className="text-center">
            <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">Pricing Plans</h2>
            <p className="text-lg mb-4 leading-relaxed text-gray-300 max-w-xl mx-auto">
              Short description about pricing plans.
            </p>
            <div className="flex flex-col md:flex-row md:space-x-8 justify-center">
              <div className="flex-1 bg-gradient-to-br from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)] p-12 rounded-lg shadow-lg mb-6 md:mb-0">
                <h3 className="text-xl font-semibold mb-2 text-white">Plan A</h3>
                <p className="mb-4 text-gray-300">$XX/month</p>
                <ul className="text-gray-300 text-left space-y-2">
                  <li>Feature A1</li>
                  <li>Feature A2</li>
                  <li>Feature A3</li>
                </ul>
                <GlowButton onClick={() => console.log("Plan A selected")}>
                  Choose Plan A
                </GlowButton>
              </div>
              <div className="flex-1 bg-gradient-to-br from-[var(--medflow-brand-7)] via-[var(--medflow-brand-6)] to-[var(--medflow-brand-1)] p-12 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2 text-white">Plan B</h3>
                <p className="mb-4 text-gray-300">$XX/month</p>
                <ul className="text-gray-300 text-left space-y-2">
                  <li>Feature B1</li>
                  <li>Feature B2</li>
                  <li>Feature B3</li>
                </ul>
                <GlowButton onClick={() => console.log("Plan B selected")}>
                  Choose Plan B
                </GlowButton>
              </div>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section id="contact" className="text-center">
            <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">Contact Us</h2>
            <p className="text-lg mb-4 leading-relaxed text-gray-300 max-w-lg mx-auto">
              Contact information or form placeholder.
            </p>
            <GlowButton onClick={() => console.log("Contact button clicked")}>
              Contact Button
            </GlowButton>
          </section>
        </FadeInSection>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-700 text-gray-400 text-sm">
        © 2025 MedFlow. All rights reserved.
      </footer>
    </div>
  );
}

