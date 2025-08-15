import React from "react";

interface Feature {
  id: string;
  text: string;
}

interface FeaturesProps {
  title: string;
  features: Feature[];
  className?: string;
}

export default function Features({ title, features, className = "" }: FeaturesProps) {
  return (
    <section id="features" className={`text-center ${className}`}>
      <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">{title}</h2>
      <ul className="text-lg mb-4 leading-relaxed text-gray-300 text-left max-w-3xl mx-auto space-y-4">
        {features.map((feature) => (
          <li key={feature.id}>• {feature.text}</li>
        ))}
      </ul>
    </section>
  );
}

