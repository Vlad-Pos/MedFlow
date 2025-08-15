import React, { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

// 1. FadeInSection: scroll-triggered fade-in for smooth content reveal
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FadeInSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInVariants}
    >
      {children}
    </motion.div>
  );
}

// 2. GlowButton: sophisticated button with motion animations and glow effects
export function GlowButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="
        px-6 py-3 rounded-lg bg-purple-700 text-white font-semibold
        focus:outline-none focus:ring-4 focus:ring-purple-500
        relative overflow-hidden
        transition duration-300 ease-in-out
      "
      whileHover={{ scale: 1.05 }}
      whileFocus={{ scale: 1.05 }}
      // Glow effect via box-shadow animation
      style={{
        boxShadow:
          "0 0 8px 2px rgba(161, 138, 178, 0.7), 0 0 12px 4px rgba(146, 128, 165, 0.5)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {/* Optional: add a subtle animated glow pulse */}
      <motion.span
        className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 10px 3px rgba(161, 138, 178, 0.5)",
            "0 0 20px 6px rgba(161, 138, 178, 0.9)",
            "0 0 10px 3px rgba(161, 138, 178, 0.5)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}

// 3. ScrollGradientBackground: scroll-triggered linear gradient background shifts
const colors = [
  "#A18AB2",
  "#9280A5",
  "#847697",
  "#756C8A",
  "#66627D",
  "#58586F",
  "#494E62",
];

export function ScrollGradientBackground({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const [bgStyle, setBgStyle] = useState(
    `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
  );

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      if (latest < 0.2) {
        setBgStyle(`linear-gradient(135deg, ${colors[0]}, ${colors[1]})`);
      } else if (latest < 0.4) {
        setBgStyle(`linear-gradient(135deg, ${colors[1]}, ${colors[2]})`);
      } else if (latest < 0.6) {
        setBgStyle(`linear-gradient(135deg, ${colors[2]}, ${colors[3]})`);
      } else if (latest < 0.8) {
        setBgStyle(`linear-gradient(135deg, ${colors[4]}, ${colors[5]})`);
      } else {
        setBgStyle(`linear-gradient(135deg, ${colors[5]}, ${colors[6]})`);
      }
    });
  }, [scrollYProgress]);

  return (
    <motion.div
      style={{ background: bgStyle }}
      className="min-h-screen w-full text-white transition-colors duration-500"
    >
      {children}
    </motion.div>
  );
}
