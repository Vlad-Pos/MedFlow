import React from "react";
import { ScrollGradientBackground, GlowButton } from "./modules/ui/AnimationComponents";

export default function HomePage() {
  return (
    <ScrollGradientBackground>
      <div className="min-h-[200vh] p-12 flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-semibold">MedFlow</h1>
        <p className="max-w-xl text-center text-lg text-gray-300">
          Gestionați programările medicale cu stil și eficiență.
        </p>
        <GlowButton onClick={() => alert("Programare!")}>Programează-te acum</GlowButton>
      </div>
    </ScrollGradientBackground>
  );
}


