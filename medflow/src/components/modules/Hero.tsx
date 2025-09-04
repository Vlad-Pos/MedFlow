import React from "react";
import { GlowButton } from "./ui";

interface HeroProps {
  headline: string;
  description: string;
  ctaText: string;
  onCtaClick: () => void;
  className?: string;
}

export default function Hero({ headline, description, ctaText, onCtaClick, className = "" }: HeroProps) {
  return (
    <section className={`flex flex-col items-center justify-center flex-grow px-6 py-12 max-w-5xl mx-auto text-center ${className}`}>
      <h1 className="text-4xl font-semibold mb-6 leading-snug text-white">{headline}</h1>
      <p className="text-lg mb-4 leading-relaxed text-gray-300 max-w-xl">
        {description}
      </p>
      <GlowButton onClick={onCtaClick}>
        {ctaText}
      </GlowButton>
    </section>
  );
}

