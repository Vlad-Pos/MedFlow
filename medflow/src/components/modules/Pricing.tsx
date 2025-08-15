import React from "react";
import { GlowButton } from "./ui";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  ctaText: string;
  onSelect?: () => void;
}

interface PricingProps {
  title: string;
  description: string;
  plans: PricingPlan[];
  className?: string;
}

export default function Pricing({ title, description, plans, className = "" }: PricingProps) {
  return (
    <section id="pricing" className={`text-center ${className}`}>
      <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">{title}</h2>
      <p className="text-lg mb-4 leading-relaxed text-gray-300 max-w-xl mx-auto">
        {description}
      </p>
      <div className="flex flex-col md:flex-row md:space-x-8 justify-center">
        {plans.map((plan) => (
          <div key={plan.id} className="flex-1 bg-gradient-to-br from-[#243153] via-[#494E62] to-[#847697] p-12 rounded-lg shadow-lg mb-6 md:mb-0">
            <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
            <p className="mb-4 text-gray-300">{plan.price}</p>
            <ul className="text-gray-300 text-left space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <GlowButton onClick={plan.onSelect}>
              {plan.ctaText}
            </GlowButton>
          </div>
        ))}
      </div>
    </section>
  );
}

